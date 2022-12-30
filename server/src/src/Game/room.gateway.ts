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
import { UsersService } from '../Users/users.service';
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

let boardAX = 3;
let boardBX = 3;

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
    // If oldirection is not a valid radian repair it
    if (oldDirection < 0) oldDirection += 2 * Math.PI;
    if (oldDirection > 2 * Math.PI) oldDirection -= 2 * Math.PI;
    // Calculate the new direction
    let newDirection = Math.PI - oldDirection;
    if (ratioBetweenBallAndBoard == 0) 
      newDirection =(-oldDirection);
    else
    {
      if (ratioBetweenBallAndBoard < 0.5) newDirection += ratioBetweenBallAndBoard * Math.PI / 2;
      else newDirection -= (1 - ratioBetweenBallAndBoard) * Math.PI / 2;
    }
    ////console.log("beforenewDirection: " + newDirection);
    if (newDirection < 0) newDirection += 2 * Math.PI;
    if (newDirection > 2 * Math.PI) newDirection -= 2 * Math.PI;
    if (newDirection > Math.PI / 2 - Math.PI / 8 && newDirection < Math.PI / 2 + Math.PI / 8) newDirection = Math.PI / 2 + Math.PI / 8;
    if (newDirection > 3 * Math.PI / 2 - Math.PI / 8 && newDirection < 3 * Math.PI / 2 + Math.PI / 8) newDirection = 3 * Math.PI / 2 + Math.PI / 8;
    if (newDirection > Math.PI - Math.PI / 8 && newDirection < Math.PI + Math.PI / 8) newDirection = Math.PI + Math.PI / 8;
    ////console.log("afternewDirection: " + newDirection);
    return newDirection;
  }

  checkHitBox(itemX : number, itemY : number, itemWidth : number, itemHeight : number, x : number, y : number) : boolean {
    if (x >= itemX && x <= itemX + itemWidth && y >= itemY && y <= itemY + itemHeight) return true;
    return false;
  }

  @SubscribeMessage('roomCreated')
  async handleConnect(@MessageBody() data: Irooms[]): Promise<void> {
    const rooms = await this.roomService.getRooms();
    this.server.emit('roomCreated', rooms);
  }

  @Interval(1000 / 180)
  async update() {
    const rooms = await this.roomService.getRooms();
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      
      if (room && room?.status.includes('configuring')) {
        if (room.lastActivity < Date.now() - 20000) {
          //console.log('room ' + room.id + ' destroyed');
          await this.roomService.updateRoom(room.id, {status: 'destroy'});
          this.server.in('room-' + room.id).emit('roomDestroyed', room.id);
        }
        //send time to players if the time have taken more than 1 second
        if (Date.now() - lastTime > 1000) {
          // REACTIVER CA AVANT DE PUSH OU BAN
          lastTime = Date.now();
          this.server.in('room-' + room.id).emit('roomTimeout', {time: Math.floor((room.lastActivity - Date.now() + 20000) / 1000)});
        }
      }
      else if (room && room?.status == 'playing' && room?.settings) {
        const settings = room.settings;
        if (room.ball.x + settings.ballRadius < 0 || room.ball.x + settings.ballRadius > 100) {
          if (room.ball.x + settings.ballRadius <= 0) {
            room.scoreB += 1
            this.roomService.updateRoom(room.id, { scoreB: room.scoreB });
          } else if (room.ball.x + settings.ballRadius >= 100) {
            room.scoreA += 1
            this.roomService.updateRoom(room.id, { scoreA: room.scoreA });
          }
          if (room.scoreA >= 10 || room.scoreB >= 10) {
            room.status = 'finished';
            if (room.scoreA >= 10) {
              //console.log("je donne ton ptn d'xp");
              this.usersService.addExp(room.playerA.id, 0.42);
              this.usersService.addExp(room.playerB.id, 0.15);
            }
            else if (room.scoreB >= 10) {
              //console.log("je donne ton ptn d'xp");
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
          ////console.log('playerA.id: ' + room.playerA.id + ' - playerB.id: ' + room.playerB.id);
          this.server.in('room-' + room.id).emit('roomUpdated', room);
          this.server.emit('roomUpdated-'+ room.id, room);
        } else {
          // Use checkHitBox to check if the ball hit a player or a wall
          if (this.checkHitBox(room.playerA.x, room.playerA.y, room.settings.boardWidth, room.settings.boardHeight, room.ball.x, room.ball.y)) {
            room.ball.direction = this.newDirection(room.ball.direction, (room.ball.y - room.playerA.y) / room.settings.boardHeight);
            room.ball.speed += 0.1;
            let x = room.ball.x + (Math.cos(room.ball.direction) * room.ball.speed * 0.45) ;
            let y = room.ball.y + (Math.sin(room.ball.direction) * room.ball.speed * 0.45) ;
            ////console.log('playerA hit the ball', room.ball.direction, x, ' ', y)
            let antiLoop = 0;
            while (x < room.ball.x  && antiLoop <= 15) {
              ////console.log('Je suis dans la boucle A', room.ball.direction, x, ' ', y)
              room.ball.direction =  room.ball.direction + 0.1;
              antiLoop++;
              x = room.ball.x + Math.cos(room.ball.direction) * room.ball.speed * 0.45;
              y = room.ball.y + Math.sin(room.ball.direction) * room.ball.speed * 0.45;
            }
            room.ball.x = x;
            room.ball.y = y;
            //room.ball.x += Math.cos(room.ball.direction) * room.ball.speed * 0.45;
            //room.ball.y += Math.sin(room.ball.direction) * room.ball.speed * 0.45;
          }
          else if (this.checkHitBox(room.playerB.x, room.playerB.y, room.settings.boardWidth, room.settings.boardHeight, room.ball.x, room.ball.y)) {
            room.ball.direction = this.newDirection(room.ball.direction, (room.ball.y - room.playerB.y) / room.settings.boardHeight);
            room.ball.speed += 0.1;
            let x = room.ball.x + (Math.cos(room.ball.direction) * room.ball.speed * 0.45) ;
            let y = room.ball.y + (Math.sin(room.ball.direction) * room.ball.speed * 0.45) ;
            ////console.log('playerB hit the ball', room.ball.direction, x, ' ', y)
            let antiLoop = 0;
            while (x > room.ball.x  && antiLoop <= 15) {
             ////console.log('Je suis dans la boucle B', room.ball.direction, x, ' ', y)
              antiLoop++;
              room.ball.direction =  room.ball.direction - 0.1;
              x = room.ball.x + Math.cos(room.ball.direction) * room.ball.speed * 0.45;
              y = room.ball.y + Math.sin(room.ball.direction) * room.ball.speed * 0.45;
            }
            room.ball.x = x;
            room.ball.y = y;
            //room.ball.x += Math.cos(room.ball.direction) * room.ball.speed * 0.45;
            //room.ball.y += Math.sin(room.ball.direction) * room.ball.speed * 0.45;
          }
          else if (this.checkHitBox(0, -50, 100, 51, room.ball.x, room.ball.y)) {
            ////console.log('wall hit the ball')
            room.ball.direction = this.newDirection(room.ball.direction, 0);
            let x = room.ball.x + Math.cos(room.ball.direction) * room.ball.speed * 0.35;
            let y = room.ball.y + Math.sin(room.ball.direction) * room.ball.speed * 0.35;
            let antiLoop = 0;
            while ((this.checkHitBox(0, -50, 100, 51, x, y)) && antiLoop <= 15)
            {
              antiLoop++;
              room.ball.direction =  room.ball.direction + 0.35;
              x = room.ball.x + Math.cos(room.ball.direction) * room.ball.speed * 0.35;
              y = room.ball.y + Math.sin(room.ball.direction) * room.ball.speed * 0.35;
            }
            room.ball.x = x;
            room.ball.y = y;
          }
          else if (this.checkHitBox(0, 99, 100, 51, room.ball.x, room.ball.y)) {
            ////console.log('wall hit the ball')
            room.ball.direction = this.newDirection(room.ball.direction, 0);
            let x = room.ball.x + Math.cos(room.ball.direction) * room.ball.speed * 0.35;
            let y = room.ball.y + Math.sin(room.ball.direction) * room.ball.speed * 0.35;
            let antiLoop = 0;
            while ((this.checkHitBox(0, 99, 100, 51, x, y))  && antiLoop <= 15)
            {
              room.ball.direction =  room.ball.direction + 0.35;
              antiLoop++;
              x = room.ball.x + Math.cos(room.ball.direction) * room.ball.speed * 0.35;
              y = room.ball.y + Math.sin(room.ball.direction) * room.ball.speed * 0.35;
            }
            room.ball.x = x;
            room.ball.y = y;
          }
          else {
            room.ball.x += Math.cos(room.ball.direction) * room.ball.speed * 0.2;
            room.ball.y += Math.sin(room.ball.direction) * room.ball.speed * 0.2;
          }
          // Move the ball
          this.server.in('room-' + room.id).emit('ballMovement', room);
}
        room.lastActivity = Date.now();
        if (room.ball.speed > 8)
          room.ball.speed = 8;
        this.roomService.updateRoom(room.id, { ball: room.ball, lastActivity: room.lastActivity});
      }
    }
  }

  @SubscribeMessage('joinRoomSpectate')
  async joinRoomSpectate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): Promise<void> {
    ////console.log('uwu');
    if (data?.roomId) {
      const room = await this.roomService.getRoom(data.roomId);
      if (room) {
        await client.join('room-' + room.id);
        ////console.log('rooms : ', client.rooms);
        client.data.roomId = data.roomId;
        client.data.playerId = data.playerId;
        client.data.playerName = (await this.usersService.findUserByUuid(data.id))?.username;
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
   // //console.log('call');
    if (data?.id && data?.name) {
      const rooms = await this.roomService.getRooms();
      if (rooms.length == 0) {
        ////console.log('new Room');
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
        ////console.log('crash ici : ', room);
        await this.roomService.addPlayer(room, data?.id, data?.name);
        await this.server
          .in('room-' + newRoom.id)
          .emit('searching-' + data.id, room);
      } else {
        let roomFound = false;
        for (let i = 0; i < rooms.length; i++) {
          const room = rooms[i];
          ////console.log('-- roomFound', roomFound);
          if (!roomFound && room.status == 'waiting') {
            if (room.nbPlayers == 0) {
              await this.roomService.updateRoom(room.id, {status: 'destroy'});
            } else if (
              room.nbPlayers ==
              1 && room?.playerA?.id != data?.id && room?.playerB?.id != data?.id
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
                ////console.log('player already in a room');
              }
            }
          }
        }
        if (!roomFound) {
          // create room
          ////console.log('new Room, because all full');
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
          // ////console.log("ou crash ici : ");
          this.roomService.addPlayer(_room, data?.id, data?.name);
          await client.join('room-' + newRoom.id);
          client.data.roomId = newRoom.id;
          client.data.playerId = data.id;
          client.data.playerName = (await this.usersService.findUserByUuid(data.id)).username;
          //  ////console.log('searching-' + data.id, 'room-' + newRoom.id);
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
   // //console.log("heho", tmp);
    const data = tmp?.tmpUser;
    const room = await this.roomService.getRoom(tmp?.room?.id);
 //   //console.log(  'cancelSearching', data?.id, room?.id);
    if (data?.id && data?.name && room) {
      ////console.log('cancelSearching');
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
        ////console.log('configuring');
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
          _tmp.scoreB = -_tmp.scoreB;
          if (_tmp.scoreB == 0)
            _tmp.scoreB = -42;
          _tmp.status = 'finished';
          this.usersService.addExp(room.playerA.id, 0.42);
          await this.roomService.save(_tmp);
          await this.roomService.updateRoom(room.id, {status: 'destroy'});
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
          _tmp.scoreA = -_tmp.scoreA;
          if (_tmp.scoreA == 0)
            _tmp.scoreA = -42;
          _tmp.status = 'finished';
          await this.roomService.save(_tmp);
          await this.roomService.updateRoom(room.id, {status: 'destroy'});
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
          room.status = 'destroy'
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
          {
            await this.roomService.updateRoom(room.id, {status: 'destroy'});
            room.status = 'destroy'
          }
        }
        await this.roomService.save(room);
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
          client.to('room-' + client.data.roomId).emit('playerMovement', {player: "playerA", x: boardAX, y: data.y});
          this.roomService.updateRoom(client.data.roomId, {playerA: {x: boardAX, y: data.y, status: "ready", id: client.data.playerId, name: client.data?.playerName}});
        } else if ('playerB' === data.id) {
          client.to('room-' + client.data.roomId).emit('playerMovement', {player: "playerB", x: 100 - boardBX, y: data.y});
          this.roomService.updateRoom(client.data.roomId, {playerB: {x: 100 - boardBX, y: data.y, status: "ready", id: client.data.playerId, name: client.data?.playerName}});
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
    ////console.log('socket id : ', client.id);
    if (room && (room?.status === 'configuring' || room?.status.includes('configuring'))) {
      if (room.playerA?.id === client.data?.playerId) {
        ////console.log('updateConfirugationA - difficulty', data);
        room.configurationA = data;
      }
      if (room.playerB?.id === client.data?.playerId) {
        ////console.log('updateConfirugationB - difficulty', data);
        room.configurationB = data;
      }
      room.lastActivity = Date.now();
      const _room = await this.roomService.save(room);
      this.server.in('room-' + room?.id).emit('configurationUpdated', _room);
    } //else ////console.log('action not allowed -', room?.id, room?.status);
  }

  @SubscribeMessage('confirmConfiguration')
  async confirmConfiguration(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): Promise<void> {
    const room = await this.roomService.getRoom(client.data?.roomId);
    if (room && (room?.status == 'configuring' || room?.status.includes('configuring'))) {
      if (room.playerA?.id === client.data?.playerId) {
        ////console.log('updateConfirugationA - difficulty', data);
        room.configurationA = data;
        room.configurationA.confirmed = true;
      }
      if (room.playerB?.id === client.data?.playerId) {
        ////console.log('updateConfirugationB - difficulty', data);
        room.configurationB = data;
        room.configurationB.confirmed = true;
      }
      const _room = await this.roomService.save(room);
      if (_room.configurationA?.confirmed && _room.configurationB?.confirmed) {
       // //console.log('start game');
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
        _room.settings.boardWidth = 1.5;
        _room.settings.boardHeight = 15;
        _room.ball.speed = _room.settings.defaultSpeed / 2/* 10*/;
        _room.settings.defaultSpeed = _room.settings.defaultSpeed / 2/*/ 10*/;
        _room.status = 'playing';
        _room.playerA.x = boardAX;
        _room.playerA.y = 50 - (_room.settings.boardHeight / 2);
        _room.playerB.x = 100 - boardBX;
        _room.playerB.y = 50 - (_room.settings.boardHeight / 2);
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
      ////console.log("joinInviteGame", data);
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
            room.lastActivity = Date.now();
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
          //console.log(e);
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
   // //console.log('inviteGame', data?.targetId, data?.ownId);
    if (data?.targetId && data?.ownId)
    {
      const user = await this.usersService.findUserByUuid(data.ownId);
     // //console.log('gfdgf', user);
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
