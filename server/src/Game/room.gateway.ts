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
        const settings = room.settings;
        if (room?.id) {
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
                if (ball.x + (settings.ballRadius * 100) < 0 || ball.x + (settings.ballRadius * 100) > 100) {
                    //room.status = "waiting";
                    //clearInterval(intervalList[room.id]);
                    ball.direction = Math.PI - ball.direction;
                    ball.x += ball.speed * Math.cos(ball.direction);
                    ball.y += ball.speed * Math.sin(ball.direction);

                    // Dire que un des deux a perdu
                    // Et reboot la manche si y reste des tours
                }
                else if ((ball.y + (settings.ballRadius * 100)) < 0 || (ball.y - (settings.ballRadius * 100)) < 0 || (ball.y + (settings.ballRadius * 100)) > 100 || (ball.y - (settings.ballRadius * 100)) > 100) {
                    ball.direction = -ball.direction;
                    // Ajouter aleatoire pour la direction
                    ball.x += ball.speed * Math.cos(ball.direction);
                    ball.y += ball.speed * Math.sin(ball.direction);
                }
                else if (ball.x - (settings.ballRadius * 100) < (room.playerA.x + (settings.boardWidth * 100)) && ball.x - (settings.ballRadius * 100) > (room.playerA.x) && ball.y + (settings.ballRadius * 100) > room.playerA.y && ball.y - (settings.ballRadius * 100) < room.playerA.y + (settings.boardHeight * 100)) { // La collision est un peu trop a droite a voir apres
                    ball.direction = Math.PI - ball.direction;
                    // Ajouter aleatoire pour la direction
                    ball.x += ball.speed * Math.cos(ball.direction);
                    ball.y += ball.speed * Math.sin(ball.direction);
                }
                else if (ball.x + (settings.ballRadius * 100) > (room.playerB.x) && ball.x + (settings.ballRadius * 100) < (room.playerB.x + (settings.boardWidth * 100)) && ball.y + (settings.ballRadius * 100) > room.playerB.y && ball.y - (settings.ballRadius * 100) < room.playerB.y + (settings.boardHeight * 100)) {
                    console.log("collision");
                    ball.direction = Math.PI - ball.direction;
                    // Ajouter aleatoire pour la direction
                    ball.x += ball.speed * Math.cos(ball.direction);
                    ball.y += ball.speed * Math.sin(ball.direction);
                }
                else {
                    ball.x += ball.speed * Math.cos(ball.direction);
                    ball.y += ball.speed * Math.sin(ball.direction);
                }
                room.ball = ball;
                this.server.in('room-' + room.id).emit('ballMovement', ball);
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
                const newRoom = { id: uuidv4(), configurationA: null, configurationB: null, name: data?.name + "-room", nbPlayers: 0, owner: data?.id, playerA: null, playerB: null, status: "waiting", ball: { x: 50, y: 50, direction: 0, speed: 0.5 }, settings: { boardWidth: 1, boardHeight: 10, ballRadius: 1, defaultSpeed: 0.2, defaultDirection: Math.random() * 2 * Math.PI } };
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
                for (let i = 0; i < rooms.length; i++)
                {
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
                        else {
                            // create room
                            console.log("new Room, because all full");
                            const newRoom = { id: uuidv4(), configurationA: null, configurationB: null , name: data?.name + "-room", nbPlayers: 0, owner: data?.id, playerA: null, playerB: null, status: "waiting", ball: { x: 50, y: 50, direction: 0, speed: 0.5 }, settings: { boardWidth: 1, boardHeight: 10, ballRadius: 1, defaultSpeed: 0.2, defaultDirection: Math.random() * 2 * Math.PI } };
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

        }
    }

    @SubscribeMessage('cancelSearching')
    async cancelSearching(@ConnectedSocket() client: Socket, @MessageBody() tmp: any): Promise<void> {
        const data = tmp?.tmpUser;
        const room = await this.roomService.getRoom(tmp?.room?.id);
        if (data?.id && data?.name && room) {
           // console.log("cancelSearching");
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

            client.leave('room-' + room.id);
            if (room.status == "configuring"){
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
                room.nbPlayers--;
                this.server.to('room-' + room.id).emit('playerDisconnected', room);
                room.status = "waiting"; // remove that
                //console.log("disconnect -", room.id, room.nbPlayers);
                clearInterval(intervalList[room.id]);
                this.roomService.save(room); // remove that
                if (room.nbPlayers == 0)
                    this.roomService.removeFromID(room.id);
                //await this.roomService.removeFromID(room.id);
            }
        }
    }
    @SubscribeMessage('playerMove')
    async handleMove(@ConnectedSocket() client: Socket, @MessageBody() data: any): Promise<void> {
        if (client.data?.roomId) {
            const room = await this.roomService.getRoom(client.data?.roomId);
            if (room?.status === "playing" && data?.id && data?.x && data?.y) {
                if ("playerA" === data.id) {
                    room.playerA.x = data.x;
                    room.playerA.y = data.y;
                }
                else if ("playerB" === data.id) {
                    room.playerB.x = data.x;
                    room.playerB.y = data.y;
                }
                this.server.to('room-' + room?.id).emit('playerMovement', data);
                await this.roomService.save(room);
            }
            else
                console.log("action not allowed -", room?.id, room?.status);
            //console.log("playerMove -", data);
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
        console.log("Action information", room?.id, room?.status, client.data);
        if (room && room?.status === "configuring") {
            if (data?.difficulty && room.playerA?.id === client.data?.playerId)
                room.configurationA = data.difficulty;
            if (data?.difficulty && room.playerB?.id === client.data?.playerId)
                room.configurationB = data.difficulty;
            await this.roomService.save(room);
            this.server.in('room-' + room?.id).emit('configurationUpdated', room);
        }
        else
            console.log("action not allowed -", room?.id, room?.status);
    }
}