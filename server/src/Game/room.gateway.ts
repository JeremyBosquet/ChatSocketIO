import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { randomUUID } from "crypto";
import { bindCallback, timestamp } from "rxjs";
import { Socket } from "socket.io";
import { RoomService } from "./room.service";
import { v4 as uuidv4 } from 'uuid';
import { time } from "console";

interface Irooms {
    id: string;
    name: string;
    owner: string;
    nbPlayers: number;
    status: string;
    createdAt: string;

}

interface Iready {
    roomId: string;
    playerId: string;
    playerName: string;
}

const intervalList = [];
@WebSocketGateway(5002, { cors: '*:*' })
export class RoomGateway {

    constructor(private roomService: RoomService) { }
    @WebSocketServer()
    server;

    @SubscribeMessage('roomCreated')
    async handleConnect(@MessageBody() data: Irooms[]): Promise<void> {
        const rooms = await this.roomService.getRooms();
        this.server.emit('roomCreated', rooms);
    }

    async gameLoop(roomTMP: any): Promise<void> {
        const room = await this.roomService.getRoom(roomTMP.id);
        console.log("gameLoop");
        if (room?.id) {
            const settings = room.settings;
            if (room.status === "paused") {
                //A gerer differement surement
                console.log("gameLoop - paused");
                this.roomService.removeFromID(room.id);
                clearInterval(intervalList[room.id]);
            }
            else if (room.status === "waiting") {
                console.log("gameLoop - waiting, let's play");
                room.status = "playing";
                this.server.in('room-' + room.id).emit('gameStart', room);
                this.roomService.save(room);
            }
            else if (room.status === "playing") {
                const ball = room.ball;
                console.log("gameLoop - playing", settings);
                if (ball.x + (settings.ballRadius) < 0 || ball.x + (settings.ballRadius) > 100) {
                    if (ball.x + (settings.ballRadius) < 0) {
                        room.playerB.score += 1;
                    }
                    else {
                        room.playerA.score += 1;
                    }
                    if (room.playerA.score >= 10 || room.playerB.score >= 10) {
                        room.status = "finished";
                        this.server.in('room-' + room.id).emit('gameEnd', room);
                        this.roomService.save(room);
                        clearInterval(intervalList[room.id]);
                    }
                    ball.direction = Math.random() * 2 * Math.PI;
                    ball.x = 50;
                    ball.y = 50;
                    ball.speed = room.settings.defaultSpeed;
                    room.ball = ball;
                    await this.roomService.save(room);
                    this.server.in('room-' + room.id).emit('ballMovement', room);
                    this.server.in('room-' + room.id).emit('roomUpdated', room);
                    console.log("gameLoop - ball out of bounds", ball.x, settings.ballRadius, ball.x + (settings.ballRadius), ball.x + (settings.ballRadius));
                    // Dire que un des deux a perdu
                    // Et reboot la manche si y reste des tours
                }
                else {
                    const playerA = room.playerA;
                    const playerB = room.playerB;
                    const playerAHitbox = {
                        x: playerA.x - (settings.boardWidth / 2),
                        y: playerA.y - (settings.boardHeight / 2),
                        width: settings.boardWidth,
                        height: settings.boardHeight
                    }
                    const playerBHitbox = {
                        x: playerB.x - (settings.boardWidth / 2),
                        y: playerB.y - (settings.boardHeight / 2),
                        width: settings.boardWidth,
                        height: settings.boardHeight
                    }
                    const ballHitbox = {
                        x: ball.x - (settings.ballRadius),
                        y: ball.y - (settings.ballRadius),
                        width: settings.ballRadius * 2,
                        height: settings.ballRadius * 2
                    }
                    if (ballHitbox.x < playerAHitbox.x + playerAHitbox.width &&
                        ballHitbox.x + ballHitbox.width > playerAHitbox.x &&
                        ballHitbox.y < playerAHitbox.y + playerAHitbox.height &&
                        ballHitbox.height + ballHitbox.y > playerAHitbox.y) {
                        // collision detected!
                        console.log("gameLoop - collision detected with playerA");
                        //ball.direction = Math.atan2(ball.y - playerA.y, ball.x - playerA.x);
                        ball.direction = Math.atan2(Math.sin(ball.direction), -Math.cos(ball.direction));
                        ball.speed += 0.1;
                    }
                    else if (ballHitbox.x < playerBHitbox.x + playerBHitbox.width &&
                        ballHitbox.x + ballHitbox.width > playerBHitbox.x &&
                        ballHitbox.y < playerBHitbox.y + playerBHitbox.height &&
                        ballHitbox.height + ballHitbox.y > playerBHitbox.y) {
                        // collision detected!
                        console.log("gameLoop - collision detected with playerB");
                        //ball.direction = Math.atan2(ball.y - playerB.y, ball.x - playerB.x);
                        ball.direction = Math.atan2(Math.sin(ball.direction), -Math.cos(ball.direction));
                        ball.speed += 0.1;
                    }
                    if (ball.y - (settings.ballRadius*2) < 0 || ball.y + (settings.ballRadius *2) > 100) {
                        ball.direction = Math.atan2(-Math.sin(ball.direction), Math.cos(ball.direction));
                    }
                    // check collision with top and bottom
                    ball.x += Math.cos(ball.direction) * ball.speed;
                    ball.y += Math.sin(ball.direction) * ball.speed;
                }
/*
                if (ball.y + (settings.ballRadius) < 0) {
                     ball.y = 0 + (settings.ballRadius);
                     ball.direction = -ball.direction;
                 }
                 if (ball.y - (settings.ballRadius) > 100) {
                     ball.y = 100 - (settings.ballRadius);
                     ball.direction = -ball.direction;
                 }*/

                room.ball = ball;
                console.log("ball :", ball);
                this.server.in('room-' + room.id).emit('ballMovement', room);
                await this.roomService.save(room);
            }
        }

    }
    @SubscribeMessage('iAmReady')
    async playerReady(@ConnectedSocket() client: Socket, @MessageBody() data: Iready): Promise<void> {
        const room = await this.roomService.getRoom(data.roomId);
        try {
            await this.roomService.addPlayer(room, data.playerId, data.playerName);
            //this.server.emit('playerReady', room);
        }
        catch (error) {
            if (error.message === "Room is full") {
                //console.log("errorRoomIsFull -", room.id, room.nbPlayers);
                client.join('room-' + room.id);
                this.server.to(client.id).emit('errorRoomIsFull', client.data?.playerId);
                //Spectateur ici
                //this.server.to('room-' + room.id).emit('errorRoomIsFull', error);
            }
            else if (error.message === "Player already in a room") {
                //console.log("errorPlayerAlreadyInRoom -", room.id, room.nbPlayers);
                client.join('room-' + room.id);
                this.server.in('room-' + room.id).emit('playerReady', room);
                // a gerer ptetre differement, faut surement kick l'ancien mais comment idk.
            }
            else
                console.log("error -", error.message);
        }
        finally {
            const room = await this.roomService.getRoom(data.roomId);
            if (room?.id !== null && room?.nbPlayers !== null) {
                //console.log("finally -", room.id, room.nbPlayers);
                await client.join('room-' + room.id);
                //console.log("rooms : ", client.rooms);
                client.data.roomId = data.roomId;
                client.data.playerId = data.playerId;
                //console.log("I sent a playerReady -", room.id, room.nbPlayers, "in room-" + room.id);
                if (room.playerA?.id && room.playerB?.id && room.status != "playing") {
                    //room.status = "playing";
                    //intervalList[room.id] = setInterval(this.gameLoop, 100, room);
                    intervalList[room.id] = setInterval(() => this.gameLoop(room), 200);
                }
                // Lance un qui va tout faire fonctionner
                //clearInterval(intervalList[room.id]);
                this.roomService.save(room);
                this.server.in('room-' + room.id).emit('playerReady', room);
            }
            else
                console.log("error - room is undefined");
        }
    }

    @SubscribeMessage('searching')
    async searching(@ConnectedSocket() client: Socket, @MessageBody() data: any): Promise<void> {
        console.log("call");
        if (data?.id && data?.name) {
            const rooms = await this.roomService.getRooms();
            if (rooms.length == 0) {
                console.log("new Room");
                const newRoom = { id: uuidv4(), configurationA: null, configurationB: null, name: data?.name + "-room", nbPlayers: 0, owner: data?.id, playerA: null, playerB: null, status: "waiting", ball: { x: 50, y: 50, direction: 0, speed: 0.5 }, settings: { boardWidth: 1, boardHeight: 10, ballRadius: 1, defaultSpeed: 0.2, defaultDirection: Math.random() * 2 * Math.PI, background: null } };
                await this.roomService.save(newRoom);
                const room = await this.roomService.getRoom(newRoom.id);
                await client.join('room-' + newRoom.id);
                client.data.roomId = newRoom.id;
                client.data.playerId = data.id;
                //console.log("crash ici : ", room);
                await this.roomService.addPlayer(room, data?.id, data?.name);
                await this.server.in('room-' + newRoom.id).emit('searching-' + data.id, room);
            }
            else {
                let roomFound = false;
                for (let i = 0; i < rooms.length; i++) {
                    const room = rooms[i];
                    console.log("-- roomFound", roomFound);
                    if (!roomFound && room.status == "waiting") {
                        if (room.nbPlayers == 0) {
                            this.roomService.removeFromID(room.id);
                        }
                        else if (room.nbPlayers == 1 && room?.playerA?.id != data?.id && room?.playerB?.id != data?.id) {
                            // join room
                            await client.join('room-' + room.id);
                            client.data.roomId = room.id;
                            client.data.playerId = data.id;
                            // Passer la game en configuration
                            await this.server.in('room-' + room.id).emit('searching-' + data.id, room);
                            try {
                                await this.roomService.addPlayer(room, data?.id, data?.name);
                                const _room = await this.roomService.getRoom(room.id);
                                _room.status = "configuring";
                                await this.server.in('room-' + room.id).emit('configuring', _room);
                                await this.roomService.save(_room);
                            }
                            catch (error) {
                                //faut gerer les throw ici 
                            }
                            roomFound = true;
                            return;
                        }
                    }
                }
                if (!roomFound) {
                    // create room
                    console.log("new Room, because all full");
                    const newRoom = { id: uuidv4(), configurationA: null, configurationB: null, name: data?.name + "-room", nbPlayers: 0, owner: data?.id, playerA: null, playerB: null, status: "waiting", ball: { x: 50, y: 50, direction: 0, speed: 0.5 }, settings: { boardWidth: 1, boardHeight: 10, ballRadius: 1, defaultSpeed: 0.2, defaultDirection: Math.random() * 2 * Math.PI, background: null } };
                    await this.roomService.save(newRoom);
                    const _room = await this.roomService.getRoom(newRoom.id);
                    // console.log("ou crash ici : ");
                    this.roomService.addPlayer(_room, data?.id, data?.name);
                    await client.join('room-' + newRoom.id);
                    client.data.roomId = newRoom.id;
                    client.data.playerId = data.id;
                    //  console.log('searching-' + data.id, 'room-' + newRoom.id);
                    await this.server.in('room-' + newRoom.id).emit('searching-' + data.id, _room);
                    roomFound = true;
                    return;
                }
            }

        }
    }

    @SubscribeMessage('cancelSearching')
    async cancelSearching(@ConnectedSocket() client: Socket, @MessageBody() tmp: any): Promise<void> {
        const data = tmp?.tmpUser;
        const room = await this.roomService.getRoom(tmp?.room?.id);
        console.log("cancelSearching", data?.id, room?.id);
        if (data?.id && data?.name && room) {
            console.log("cancelSearching");
            if (room?.playerA?.id == client.data.playerId)
                room.playerA = null;
            else if (room?.playerB?.id == client.data.playerId)
                room.playerB = null;
            else {
                console.log("error - player not found - (Call tnard car c la merde ou spectateur)");
                return;
            }
            room.nbPlayers--;
            this.server.to('room-' + room.id).emit('playerDisconnected', room);
            client.data.roomId = null;
            client.data.playerId = null;
            room.configurationA = null;
            room.configurationB = null;
            client.leave('room-' + room.id);
            if (room.status == "configuring") {
                console.log("configuring");
                room.status = "waiting";
                this.server.in('room-' + room.id).emit('playerLeave');
            }
            room.status = "waiting";
            if (intervalList[room.id])
                clearInterval(intervalList[room.id]);
            this.roomService.save(room);
            if (room.nbPlayers == 0)
                this.roomService.removeFromID(room.id);
        }
    }

    @SubscribeMessage('disconnect')
    async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
        // gerer le cas ou le joueur deco pendant la configuration
        if (client.data.roomId !== undefined) {
            const room = await this.roomService.getRoom(client.data.roomId);
            if (room && room?.id && room?.nbPlayers !== null) {
                //console.log(client.data.playerId, client.data.roomId, room.playerA?.id, room.playerB?.id);
                if (room?.playerA?.id == client.data.playerId)
                    room.playerA = null;
                else if (room?.playerB?.id == client.data.playerId)
                    room.playerB = null;
                else {
                    console.log("error - player not found - (Call tnard car c la merde ou spectateur)");
                    return;
                }
                if (room.status == "configuring") {
                    room.status = "waiting";
                    this.server.in('room-' + room.id).emit('playerLeave');
                }
                client.data.roomId = null;
                client.data.playerId = null;
                client.leave('room-' + room.id);
                room.configurationA = null;
                room.configurationB = null;
                room.nbPlayers--;
                this.server.to('room-' + room.id).emit('playerDisconnected', room);
                if (room.status == "playing") {
                    this.server.to('room-' + room.id).emit('gameForceEnd', room);
                    if (intervalList[room.id])
                        clearInterval(intervalList[room.id]);
                    this.roomService.removeFromID(room.id);
                }
                else {
                    room.status = "waiting"; // remove that
                    //console.log("disconnect -", room.id, room.nbPlayers);
                    if (intervalList[room.id])
                        clearInterval(intervalList[room.id]);
                    this.roomService.save(room); // remove that
                    if (room.nbPlayers == 0)
                        this.roomService.removeFromID(room.id);
                }
            }
        }
    }
    @SubscribeMessage('playerMove')
    async handleMove(@ConnectedSocket() client: Socket, @MessageBody() data: any): Promise<void> {
        if (client.data?.roomId) {
            const room = await this.roomService.getRoom(client.data?.roomId);
            console.log("room emit received", Math.random());
            if (room && room?.status === "playing" && data?.id && data?.x != undefined && data?.y) {
                if ("playerA" === data.id) {
                    room.playerA.x = data.x;
                    room.playerA.y = data.y;
                }
                else if ("playerB" === data.id) {
                    room.playerB.x = data.x;
                    room.playerB.y = data.y;
                }
                const _room = await this.roomService.save(room);
                this.server.to('room-' + room?.id).emit('playerMovement', _room);
            }
            else
                console.log("action not allowed -", room?.id, room?.status);
        }
    }
    @SubscribeMessage('ballMove')
    async handleBallMove(@ConnectedSocket() client: Socket, @MessageBody() data: any): Promise<void> {
        const room = await this.roomService.getRoom(client.data?.roomId);
        this.server.to('room-' + room?.id).emit('ballMovement', data);
    }

    @SubscribeMessage('updateConfirugation')
    async updateConfirugation(@ConnectedSocket() client: Socket, @MessageBody() data: any): Promise<void> {
        const room = await this.roomService.getRoom(client.data?.roomId);
        if (room && room?.status === "configuring") {
            if (room.playerA?.id === client.data?.playerId) {
                console.log("updateConfirugationA - difficulty", data);
                room.configurationA = data;
            }
            if (room.playerB?.id === client.data?.playerId) {
                console.log("updateConfirugationB - difficulty", data);
                room.configurationB = data;
            }
            const _room = await this.roomService.save(room);
            this.server.in('room-' + room?.id).emit('configurationUpdated', _room);
        }
        else
            console.log("action not allowed -", room?.id, room?.status);
    }

    @SubscribeMessage('confirmConfiguration')
    async confirmConfiguration(@ConnectedSocket() client: Socket, @MessageBody() data: any): Promise<void> {
        const room = await this.roomService.getRoom(client.data?.roomId);
        if (room && room?.status === "configuring") {
            if (room.playerA?.id === client.data?.playerId) {
                console.log("updateConfirugationA - difficulty", data);
                room.configurationA = data;
                room.configurationA.confirmed = true;
            }
            if (room.playerB?.id === client.data?.playerId) {
                console.log("updateConfirugationB - difficulty", data);
                room.configurationB = data;
                room.configurationB.confirmed = true;
            }
            const _room = await this.roomService.save(room);
            if (_room.configurationA?.confirmed && _room.configurationB?.confirmed) {
                console.log("start game");
                const random = Math.floor(Math.random() * 2);
                if (random === 0) {
                    if (_room.configurationA.difficulty === "easy")
                        _room.settings.defaultSpeed = 3;
                    else if (_room.configurationA.difficulty === "medium")
                        _room.settings.defaultSpeed = 4;
                    else if (_room.configurationA.difficulty === "hard")
                        _room.settings.defaultSpeed = 5;
                    _room.settings.background = _room.configurationA.background;
                }
                else {
                    if (_room.configurationB.difficulty === "easy")
                        _room.settings.defaultSpeed = 3;
                    else if (_room.configurationB.difficulty === "medium")
                        _room.settings.defaultSpeed = 4;
                    else if (_room.configurationB.difficulty === "hard")
                        _room.settings.defaultSpeed = 5;
                    _room.settings.background = _room.configurationB.background;
                }
                _room.settings.defaultDirection = Math.random() * Math.PI * 2;
                _room.ball.direction = _room.settings.defaultDirection;
                _room.settings.ballRadius = 1;
                _room.settings.boardWidth = 1;
                _room.settings.boardHeight = 10;
                _room.ball.speed = _room.settings.defaultSpeed;
                _room.status = "playing";
                _room.playerA.x = 5;
                _room.playerA.y = 50;
                _room.playerB.x = 0;
                _room.playerB.y = 50;
                intervalList[_room.id] = setInterval(() => this.gameLoop(_room), 250);
                await this.roomService.save(_room)
                this.server.in('room-' + _room?.id).emit('gameStart', _room);
                this.server.in('room-' + _room?.id).emit('playerReady', _room);
            }
            this.server.in('room-' + _room?.id).emit('configurationUpdated', _room);
        }
        else
            console.log("action not allowed -", room?.id, room?.status);
    }
}