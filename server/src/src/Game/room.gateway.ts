import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { bindCallback, timestamp } from 'rxjs';
import { Socket } from 'socket.io';
import { RoomService } from './room.service';
import { v4 as uuidv4 } from 'uuid';
import { time } from 'console';
import { exit } from 'process';
import { UsersService } from '../users/users.service';
import { date } from 'joi';
import { Interval } from '@nestjs/schedule';

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
const roomList = [];
let lastTime = Date.now();
let averageTime = 0;
const lasttimestamp = [];
@WebSocketGateway(7002, { cors: '*:*' })
export class RoomGateway {
  constructor(private roomService: RoomService, private usersService: UsersService) {}
  @WebSocketServer()
  server;

  generateDirection() : number {
    // Generate a random direction between 310 and 50 degrees or 130 and 230 degrees (in radians)
    // If the direction is too close to the vertical axis, change it
    let direction = Math.random() * Math.PI;
    if (direction > Math.PI / 2 - Math.PI / 8 && direction < Math.PI / 2 + Math.PI / 8) direction = Math.PI / 2 + Math.PI / 8;
    if (direction > 3 * Math.PI / 2 - Math.PI / 8 && direction < 3 * Math.PI / 2 + Math.PI / 8) direction = 3 * Math.PI / 2 + Math.PI / 8;
    if (direction > Math.PI - Math.PI / 8 && direction < Math.PI + Math.PI / 8) direction = Math.PI + Math.PI / 8;
    return direction;
  }

  newDirection(oldDirection: number, ratioBetweenBallAndBoard: number) : number{
    const newDirection = Math.PI / 2 + ratioBetweenBallAndBoard * Math.PI / 2;
    if (oldDirection > Math.PI) return Math.PI * 2 - newDirection;
    else return newDirection;
  }

  @SubscribeMessage('roomCreated')
  async handleConnect(@MessageBody() data: Irooms[]): Promise<void> {
    const rooms = await this.roomService.getRooms();
    this.server.emit('roomCreated', rooms);
  }

  @Interval(1000 / 120)
  async update() {
    const rooms = await this.roomService.getRooms();
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      
      if (room && room?.status == 'configuring') {
        if (room.lastActivity < Date.now() - 20000) {
          await this.roomService.updateRoom(room.id, {status: 'destroy'});
          this.server.in(room.id).emit('roomDestroyed', room.id);
        }
        //send time to players if the time have taken more than 1 second
        if (Date.now() - lastTime > 1000) {
          lastTime = Date.now();
          this.server.in('room-' + room.id).emit('roomTimeout', {timeouts : Date.now() - room.lastActivity + 20000});
        }
      }
      else if (room && room?.status == 'playing' && room?.settings) {
        const settings = room.settings;
        if (room.ball.x + settings.ballRadius <= 0 || room.ball.x + settings.ballRadius >= 100) {
          if (room.ball.x + settings.ballRadius <= 0) {
            room.scoreB += 1
            this.roomService.updateRoom(room.id, { scoreB: room.scoreB });
          } else if (room.ball.x + settings.ballRadius >= 100) {
            room.scoreA += 1
            this.roomService.updateRoom(room.id, { scoreA: room.scoreA });
          }
          if (room.scoreA >= 1000 || room.scoreB >= 1000) {
            room.status = 'finished';
            if (room.scoreA >= 1) {
              console.log("je donne ton ptn d'xp");
              this.usersService.addExp(room.playerA.id, 0.42);
              this.usersService.addExp(room.playerB.id, 0.15);
            }
            else if (room.scoreB >= 1) {
              console.log("je donne ton ptn d'xp");
              this.usersService.addExp(room.playerB.id, 0.42);
              this.usersService.addExp(room.playerA.id, 0.15);
            }
            this.roomService.save(room);
            this.server.emit('roomFinished', room);
            this.server.in('room-' + room.id).emit('gameEnd', room);
            const playerA = room.status.split('|')[1];
            const playerB = room.status.split('|')[2];
            if (playerA)
              this.server.emit('gameRemoveInvite', { target: playerA, room: room });
            if (playerB)
              this.server.emit('gameRemoveInvite', { target: playerB, room: room });
            clearInterval(intervalList[room.id]);
          }
          room.ball.direction = this.generateDirection();
          room.ball.x = 50;
          room.ball.y = 50;
          room.ball.speed = room.settings.defaultSpeed;
          this.roomService.updateRoom(room.id, { ball: room.ball });
          this.server.in('room-' + room.id).emit('ballMovement', room);
          this.server.in('room-' + room.id).emit('roomUpdated', room);
        } else {
          const playerA = room.playerA;
          const playerB = room.playerB;
          if (
            room.ball.x + settings.ballRadius > playerA.x &&
            room.ball.x - settings.ballRadius < playerA.x + settings.boardWidth &&
            room.ball.y > playerA.y &&
            room.ball.y < playerA.y + settings.boardHeight
          ) {
            console.log('gameLoop - collision with playerA');
            room.ball.direction = this.newDirection(Math.PI - room.ball.direction, room.ball.x - playerA.x - settings.boardWidth / 2);
            room.ball.x += room.ball.speed * 0.3 * Math.cos(room.ball.direction);
            room.ball.y += room.ball.speed * 0.3 * Math.sin(room.ball.direction);
            room.ball.speed += 0.15;
          }
          else if (
            room.ball.x - settings.ballRadius < playerB.x &&
            room.ball.x + settings.ballRadius > playerB.x &&
            room.ball.y > playerB.y &&
            room.ball.y < playerB.y + settings.boardHeight
          ) {
            console.log('gameLoop - collision with playerB');
            room.ball.direction = this.newDirection(Math.PI - room.ball.direction, room.ball.x - playerB.x - settings.boardWidth / 2);
            room.ball.x += room.ball.speed * 0.3 * Math.cos(room.ball.direction);
            room.ball.y += room.ball.speed * 0.3 * Math.sin(room.ball.direction);
            room.ball.speed += 0.15;
          }
          else if (
            room.ball.y - settings.ballRadius * 0.75 <= 0 ||
            room.ball.y + settings.ballRadius * 1.5 >= 100
          ) {
            console.log('gameLoop - collision top or bottom');
            if (room.ball.y < 0) {
              room.ball.y = 0 + settings.ballRadius;
            } else if (room.ball.y + settings.ballRadius > 100) {
              room.ball.y = 100 - settings.ballRadius;
            }
            room.ball.direction = -room.ball.direction;
            room.ball.x += room.ball.speed * 0.3 * Math.cos(room.ball.direction);
            room.ball.y += room.ball.speed * 0.3 * Math.sin(room.ball.direction);
            room.ball.speed += 0.15;
          }
          else {
            room.ball.x += room.ball.speed * 0.2 * Math.cos(room.ball.direction);
            room.ball.y += room.ball.speed * 0.2 * Math.sin(room.ball.direction);
          }
          this.server.in('room-' + room.id).emit('ballMovement', room);
        }
        room.lastActivity = Date.now();
        this.roomService.updateRoom(room.id, { ball: room.ball, lastActivity: room.lastActivity });
      }
    }
  }

  @SubscribeMessage('joinRoomSpectate')
  async joinRoomSpectate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): Promise<void> {
    //console.log('uwu');
    if (data?.roomId) {
      const room = await this.roomService.getRoom(data.roomId);
      if (room) {
        //console.log('joinRoomSpectate -', room.id, room.nbPlayers);
        await client.join('room-' + room.id);
        //console.log('rooms : ', client.rooms);
        client.data.roomId = data.roomId;
        client.data.playerId = data.playerId;
        client.data.playerName = (await this.usersService.findUserByUuid(data.id)).username;
        this.server.in('room-' + room.id).emit('gameInit', room);
      } else {
        this.server
          .in(client.id)
          .emit('errorRoomNotFound', client.data?.playerId);
      }
    }
  }
  @SubscribeMessage('searching')
  async searching(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): Promise<void> {
   // console.log('call');
    if (data?.id && data?.name) {
      const rooms = await this.roomService.getRooms();
      if (rooms.length == 0) {
        //console.log('new Room');
        const newRoom = {
          id: uuidv4(),
          configurationA: null,
          configurationB: null,
          name: data?.name + '-room',
          nbPlayers: 0,
          owner: data?.id,
          playerA: null,
          playerB: null,
          scoreA: 0,
          scoreB: 0,
          status: 'waiting',
          ball: { x: 50, y: 50, direction: 0, speed: 0.5 },
          settings: {
            boardWidth: 1,
            boardHeight: 10,
            ballRadius: 1,
            defaultSpeed: 0.2,
            defaultDirection: Math.random() * 2 * Math.PI,
            background: null,
          },
          lastActivity: Date.now(),
        };
        await this.roomService.save(newRoom);
        const room = await this.roomService.getRoom(newRoom.id);
        await client.join('room-' + newRoom.id);
        client.data.roomId = newRoom.id;
        client.data.playerId = data.id;
        client.data.playerName = (await this.usersService.findUserByUuid(data.id)).username;
        //console.log('crash ici : ', room);
        await this.roomService.addPlayer(room, data?.id, data?.name);
        await this.server
          .in('room-' + newRoom.id)
          .emit('searching-' + data.id, room);
      } else {
        let roomFound = false;
        for (let i = 0; i < rooms.length; i++) {
          const room = rooms[i];
          //console.log('-- roomFound', roomFound);
          if (!roomFound && room.status == 'waiting') {
            if (room.nbPlayers == 0) {
              await this.roomService.updateRoom(room.id, {status: 'destroy'});
            } else if (
              room.nbPlayers ==
              1 /*&& room?.playerA?.id != data?.id && room?.playerB?.id != data?.id*/
            ) {
              // join room
              await client.join('room-' + room.id);
              client.data.roomId = room.id;
              client.data.playerId = data.id;
              client.data.playerName = (await this.usersService.findUserByUuid(data.id)).username;
              // Passer la game en configuration
              await this.server
                .in('room-' + room.id)
                .emit('searching-' + data.id, room);
              try {
                await this.roomService.addPlayer(room, data?.id, data?.name); // re foutre la secu pour double joueur
                const _room = await this.roomService.getRoom(room.id);
                _room.status = 'configuring';
                _room.lastActivity = Date.now();
                await this.server
                  .in('room-' + room.id)
                  .emit('configuring', _room);
                await this.roomService.save(_room);
                roomFound = true;
                return;
              } catch (error) {
                //faut gerer les throw ici
                //console.log('player already in a room');
              }
            }
          }
        }
        if (!roomFound) {
          // create room
          //console.log('new Room, because all full');
          const newRoom = {
            id: uuidv4(),
            configurationA: null,
            configurationB: null,
            name: data?.name + '-room',
            nbPlayers: 0,
            owner: data?.id,
            playerA: null,
            playerB: null,
            scoreA: 0,
            scoreB: 0,
            status: 'waiting',
            ball: { x: 50, y: 50, direction: 0, speed: 0.5 },
            settings: {
              boardWidth: 1,
              boardHeight: 10,
              ballRadius: 1,
              defaultSpeed: 0.2,
              defaultDirection: Math.random() * 2 * Math.PI,
              background: null,
            },
            lastActivity: Date.now(),
          };
          await this.roomService.save(newRoom);
          const _room = await this.roomService.getRoom(newRoom.id);
          // //console.log("ou crash ici : ");
          this.roomService.addPlayer(_room, data?.id, data?.name);
          await client.join('room-' + newRoom.id);
          client.data.roomId = newRoom.id;
          client.data.playerId = data.id;
          client.data.playerName = (await this.usersService.findUserByUuid(data.id)).username;
          //  //console.log('searching-' + data.id, 'room-' + newRoom.id);
          await this.server
            .in('room-' + newRoom.id)
            .emit('searching-' + data.id, _room);
          roomFound = true;
          return;
        }
      }
    }
  }

  @SubscribeMessage('cancelSearching')
  async cancelSearching(
    @ConnectedSocket() client: Socket,
    @MessageBody() tmp: any,
  ): Promise<void> {
   // console.log("heho", tmp);
    const data = tmp?.tmpUser;
    const room = await this.roomService.getRoom(tmp?.room?.id);
 //   console.log(  'cancelSearching', data?.id, room?.id);
    if (data?.id && data?.name && room) {
      //console.log('cancelSearching');
      if (room.status.startsWith('waiting|')) {
        const playerA = room.status.split('|')[1];
        const playerB = room.status.split('|')[2];

        if (playerA)
          this.server.emit('gameRemoveInvite', {target: playerA, room:room});
        if (playerB)
          this.server.emit('gameRemoveInvite', {target: playerB, room:room});
      }
      if (room?.playerA?.id == client.data.playerId) room.playerA = null;
      else if (room?.playerB?.id == client.data.playerId) room.playerB = null;
      else {
        return;
      }
      room.nbPlayers--;
      this.server.to('room-' + room.id).emit('playerDisconnected', room);
      client.data.roomId = null;
      client.data.playerName = null;
      client.data.playerId = null;
      room.configurationA = null;
      room.configurationB = null;
      client.leave('room-' + room.id);
      if (room.status == 'configuring' || room?.status.includes('configuring')) {
        //console.log('configuring');
        if (room.status == 'configuring')
        {
          room.status = 'waiting';
          this.server.in('room-' + room.id).emit('playerLeave');
        } 
        else
        {
          const playerA = room.status.split('|')[1];
          const playerB = room.status.split('|')[2];
          if (playerA)
            this.server.emit('gameRemoveInvite', {target: playerA, room:room});
          if (playerB)
            this.server.emit('gameRemoveInvite', {target: playerB, room:room});
          this.server.in('room-' + room.id).emit('playerLeave');
          // detruire la room car l'autre a quitté
          await this.roomService.updateRoom(room.id, {status: 'destroy'});
        }
      }
      room.status = 'waiting';
      if (intervalList[room.id]) clearInterval(intervalList[room.id]);

      roomList[room.id] = null;
      await this.roomService.save(room);
      if (room.nbPlayers == 0) 
        await this.roomService.updateRoom(room.id, {status: 'destroy'});
    }
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    // gerer le cas ou le joueur deco pendant la configuration
    if (client.data.roomId !== undefined) {
      const room = await this.roomService.getRoom(client.data.roomId);
      if (room && room?.id && room?.nbPlayers !== null && room.status != 'finished') {        
        const playerA = room.status.split('|')[1];
        const playerB = room.status.split('|')[2];
        if (playerA)
          this.server.emit('gameRemoveInvite', {target: playerA, room:room});
        if (playerB)
          this.server.emit('gameRemoveInvite', {target: playerB, room:room});
        if (room?.playerB?.id == client.data.playerId && room.status == 'playing')
        {
          const _tmp = {
            id: uuidv4(),
            configurationA: room.configurationA,
            configurationB: room.configurationB,
            name: room.name,
            nbPlayers: room.nbPlayers,
            owner: room.owner,
            playerA: room.playerA,
            playerB: room.playerB,
            scoreA: room.scoreA,
            scoreB: room.scoreB,
            status: room.status,
            ball: room.ball,
            settings: room.settings,
            lastActivity: Date.now(),
          };
          _tmp.scoreA++;
          _tmp.scoreB = -1;
          _tmp.status = 'finished';
          this.usersService.addExp(room.playerA.id, 0.42);
          await this.roomService.save(_tmp);
        }
        else if (room?.playerA?.id == client.data.playerId && room.status == 'playing')
        {
          const _tmp = {
            id: uuidv4(),
            configurationA: room.configurationA,
            configurationB: room.configurationB,
            name: room.name,
            nbPlayers: room.nbPlayers,
            owner: room.owner,
            playerA: room.playerA,
            playerB: room.playerB,
            scoreA: room.scoreA,
            scoreB: room.scoreB,
            status: room.status,
            ball: room.ball,
            settings: room.settings,
            lastActivity: Date.now(),
          };
          this.usersService.addExp(room.playerB.id, 0.42);
          _tmp.scoreB++;
          _tmp.scoreA = -1;
          _tmp.status = 'finished';
          await this.roomService.save(_tmp);
        }
        if (room?.playerA?.id == client.data.playerId) room.playerA = null;
        else if (room?.playerB?.id == client.data.playerId) room.playerB = null;
        else {
          return;
        }
        if (room.status == 'configuring' || room?.status.includes('configuring')) {
          if (room.status == 'configuring')
          {
            room.status = 'waiting';
            this.server.in('room-' + room.id).emit('playerLeave');
          }
          else
          {
            this.server.in('room-' + room.id).emit('playerLeave');
            const playerA = room.status.split('|')[1];
            const playerB = room.status.split('|')[2];
            if (playerA)
              this.server.emit('gameRemoveInvite', {target: playerA, room:room});
            if (playerB)
              this.server.emit('gameRemoveInvite', {target: playerB, room:room});
            await this.roomService.updateRoom(room.id, {status: 'destroy'});
          }
        }
        client.data.roomId = null;
        client.data.playerName = null;
        client.data.playerId = null;
        client.leave('room-' + room.id);
        room.configurationA = null;
        room.configurationB = null;
        room.nbPlayers--;
        this.server.to('room-' + room.id).emit('playerDisconnected', room);
        if (room.status == 'playing') {
          this.server.emit('roomFinished', room);
          this.server.to('room-' + room.id).emit('gameForceEnd', room);
          if (intervalList[room.id]) clearInterval(intervalList[room.id]);
          roomList[room.id] = null;
          const playerA = room.status.split('|')[1];
          const playerB = room.status.split('|')[2];
          if (playerA)
            this.server.emit('gameRemoveInvite', {target: playerA, room:room});
          if (playerB)
            this.server.emit('gameRemoveInvite', {target: playerB, room:room});

          await this.roomService.updateRoom(room.id, {status: 'destroy'});
        } else {
          room.status = 'waiting'; // remove that
          if (intervalList[room.id]) clearInterval(intervalList[room.id]);
          roomList[room.id] = null;
          this.roomService.save(room); // remove that
          if (room.nbPlayers == 0) 
            await this.roomService.updateRoom(room.id, {status: 'destroy'});
        }
      }
    }
  }

  @SubscribeMessage('playerMove')
  handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    if (client.data?.roomId) {
      if (
        data?.id &&
        data?.x != undefined &&
        data?.y != undefined
     ) {
        if ('playerA' === data.id) {
          client.to('room-' + client.data.roomId).emit('playerMovement', {player: "playerA", x: 1, y: data.y});
          this.roomService.updateRoom(client.data.roomId, {playerA: {x: 1, y: data.y, status: "ready", id: client.data.playerId, name: client.data?.playerName}});
        } else if ('playerB' === data.id) {
          client.to('room-' + client.data.roomId).emit('playerMovement', {player: "playerB", x: 99.5, y: data.y});
          this.roomService.updateRoom(client.data.roomId, {playerB: {x: 99, y: data.y, status: "ready", id: client.data.playerId, name: client.data?.playerName}});
        }
      }
    }
  }

//@SubscribeMessage('ballMove')
//async handleBallMove(
//  @ConnectedSocket() client: Socket,
//  @MessageBody() data: any,
//): Promise<void> {
//  const room = await this.roomService.getRoom(client.data?.roomId);
//  room.ball.x = data.x;
//  room.ball.y = data.y;
//  //console;
//  await this.roomService.save(room);
//}

  @SubscribeMessage('updateConfirugation')
  async updateConfirugation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): Promise<void> {
    const room = await this.roomService.getRoom(client.data?.roomId);
    //console.log('socket id : ', client.id);
    if (room && (room?.status === 'configuring' || room?.status.includes('configuring'))) {
      if (room.playerA?.id === client.data?.playerId) {
        //console.log('updateConfirugationA - difficulty', data);
        room.configurationA = data;
      }
      if (room.playerB?.id === client.data?.playerId) {
        //console.log('updateConfirugationB - difficulty', data);
        room.configurationB = data;
      }
      room.lastActivity = Date.now();
      const _room = await this.roomService.save(room);
      this.server.in('room-' + room?.id).emit('configurationUpdated', _room);
    } //else //console.log('action not allowed -', room?.id, room?.status);
  }

  @SubscribeMessage('confirmConfiguration')
  async confirmConfiguration(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): Promise<void> {
    const room = await this.roomService.getRoom(client.data?.roomId);
    if (room && (room?.status == 'configuring' || room?.status.includes('configuring'))) {
      if (room.playerA?.id === client.data?.playerId) {
        //console.log('updateConfirugationA - difficulty', data);
        room.configurationA = data;
        room.configurationA.confirmed = true;
      }
      if (room.playerB?.id === client.data?.playerId) {
        //console.log('updateConfirugationB - difficulty', data);
        room.configurationB = data;
        room.configurationB.confirmed = true;
      }
      const _room = await this.roomService.save(room);
      if (_room.configurationA?.confirmed && _room.configurationB?.confirmed) {
       // console.log('start game');
        const random = Math.floor(Math.random() * 2);
        _room.settings.defaultSpeed = 3;
        if (random === 0) {
          if (_room.configurationA.difficulty === 'easy')
            _room.settings.defaultSpeed = 3;
          else if (_room.configurationA.difficulty === 'medium')
            _room.settings.defaultSpeed = 4.5;
          else if (_room.configurationA.difficulty === 'hard')
            _room.settings.defaultSpeed = 6;
          _room.settings.background = _room.configurationA.background;
        } else {
          if (_room.configurationB.difficulty === 'easy')
            _room.settings.defaultSpeed = 3;
          else if (_room.configurationB.difficulty === 'medium')
            _room.settings.defaultSpeed = 4.5;
          else if (_room.configurationB.difficulty === 'hard')
            _room.settings.defaultSpeed = 6;
          _room.settings.background = _room.configurationB.background;
        }
        _room.settings.defaultDirection = this.generateDirection();
        _room.ball.direction = _room.settings.defaultDirection;
        _room.settings.ballRadius = 1;
        _room.settings.boardWidth = 0.75;
        _room.settings.boardHeight = 15;
        _room.ball.speed = _room.settings.defaultSpeed /* 10*/;
        _room.settings.defaultSpeed = _room.settings.defaultSpeed /*/ 10*/;
        _room.status = 'playing';
        _room.playerA.x = 1;
        _room.playerA.y = 50;
        _room.playerB.x = 99;
        _room.playerB.y = 50;
        this.server.emit('roomStarted', _room);
        room.lastActivity += 5000;
        await this.roomService.save(_room);
        roomList[room.id] = "playing";
        this.server.in('room-' + _room?.id).emit('gameStart', _room);
        this.server.in('room-' + _room?.id).emit('playerReady', _room);
      }
      this.server.in('room-' + _room?.id).emit('configurationUpdated', _room);
    }
  }

  @SubscribeMessage("joinInviteGame")
  async joinInviteGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): Promise<void> {
    if (data?.roomId && data?.playerId && data?.playerName) {
      const room = await this.roomService.getRoom(data.roomId);
      //console.log("joinInviteGame", data);
      if (room){
        try
        {
          await this.roomService.addPlayer(room, data.playerId, data.playerName);
          client.data = { roomId: room.id, playerId: data.playerId };
          await client.join('room-' + room.id);
          await this.server.to('room-' + room.id).emit('gameFetchInvite', {target: data.playerId, room:room, switch: true});
          if (room.playerA && room.playerB) {
            await this.server.to('room-' + room.id).emit('configuring', room);
            room.status = 'configuring' + "|" + room.playerA.id + "|" + room.playerB.id;
            await this.roomService.save(room);
            const playerA = room.status.split('|')[1];
            const playerB = room.status.split('|')[2];
            if (playerA)
              this.server.emit('gameRemoveInvite', {target: playerA, room:room});
            if (playerB)
              this.server.emit('gameRemoveInvite', {target: playerB, room:room});
          }
        }
        catch (e) {
          console.log(e);
          const playerA = room.status.split('|')[1];
          const playerB = room.status.split('|')[2];
          if (playerA)
            this.server.emit('gameRemoveInvite', {target: playerA, room:room});
          if (playerB)
            this.server.emit('gameRemoveInvite', {target: playerB, room:room});
          // Redirect to home
        }
      }

      
    }
  }


  @SubscribeMessage('inviteGame')
  async inviteGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): Promise<void> {
   // console.log('inviteGame', data?.targetId, data?.ownId);
    if (data?.targetId && data?.ownId)
    {
      const user = await this.usersService.findUserByUuid(data.ownId);
     // console.log('gfdgf', user);
      if (user)
      {
        const newRoom = {
          id: uuidv4(),
          configurationA: null,
          configurationB: null,
          name: user?.username + '-room',
          nbPlayers: 0,
          owner: user?.uuid,
          playerA: null,
          playerB: null,
          scoreA: 0,
          scoreB: 0,
          status: 'waiting|' + data?.ownId + '|' + data?.targetId,
          ball: { x: 50, y: 50, direction: 0, speed: 0.5 },
          settings: {
            boardWidth: 1,
            boardHeight: 10,
            ballRadius: 1,
            defaultSpeed: 0.2,
            defaultDirection: Math.random() * 2 * Math.PI,
            background: null,
          },
          lastActivity: Date.now(),
        };
        const room = await this.roomService.save(newRoom);
        await this.roomService.addPlayer(room, user.uuid, user.username);
        client.join('room-' + room.id);
        client.data = { roomId: room.id, playerId: user.uuid };
        await this.server.emit('gameFetchInvite', {room : room, target: data?.ownId, switch: true});
        await this.server.emit('gameFetchInvite', {room : room, target: data?.targetId, switch: false});

        
      }
    }
  }

  @SubscribeMessage('gameAskInvite')
  async gameAskInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): Promise<void> {
    {
      if (data?.id){
        const rooms = await this.roomService.getRooms();
        rooms.forEach(room => {
          if (room.status.startsWith('waiting|') && room.status.includes(data.id))
          {
            this.server.emit('gameFetchInvite', {room : room, target: data.id, switch: false});
          }
        });
      }
    }
  }
}
