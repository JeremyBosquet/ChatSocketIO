import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { InformationEvent } from 'http';
//import { Interval } from '@nestjs/schedule';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Room } from './Entities/room.entity';
import { SendGameHistoryDto } from './room.dto';
import { RoomGateway } from './room.gateway';

let lastTime = Date.now();
let averageTime = 0;
const lasttimestamp = [];
@Injectable()
export class RoomService {
  async checkDatabase() {
    const list = await this.roomRepository.find();
    for (let i = 0; i < list.length; i++) {
      if (list[i].status != 'finished') {
        // Pas sur que ca sois utile
      }
    }
  }
  async updateRoom(roomId: string, data: any): Promise<any> {
    return await this.roomRepository.update(roomId, data);
  }
  async clearDatabase() {
    console.log('Clear database in progress :');
    const list = await this.roomRepository.find();
    for (let i = 0; i < list.length; i++) {
      if (list[i].status != 'finished' && list[i].status != 'destroy') {
        console.log('Clearing room', list[i].id);
        await this.roomRepository.remove(list[i]);
      } else console.log('Finished room', list[i].id);
    }
    console.log('done');
  }

  constructor(
    @InjectRepository(Room) private roomRepository: Repository<Room>,
    private roomGateway: RoomGateway,
    private readonly userService: UsersService,
  ) {
    this.clearDatabase();
  }
  @Interval(1000 / 60)
  async update() {
    const rooms = await this.roomRepository.find();
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const settings = room.settings;
      if (room.status == 'playing') {
        //console.log('gameLoop', Date.now() - lastTime, Math.round(averageTime));
        if (averageTime == 0) averageTime = Date.now() - lastTime;
        else averageTime = (averageTime + Date.now() - lastTime) / 2;
        lastTime = Date.now();
        if (room.ball.x + settings.ballRadius < 0 || room.ball.x + settings.ballRadius > 100) {
          if (room.ball.x + settings.ballRadius < 0) {
            room.scoreB += 1
            this.roomRepository.update(room.id, { playerB: room.playerB });
          } else if (room.ball.x + settings.ballRadius) {
            room.scoreA += 1
            this.roomRepository.update(room.id, { playerA: room.playerA });
          }
          if (room.scoreA >= 1000 || room.scoreB >= 1000) {
            room.status = 'finished';
            if (room.scoreA >= 1) {
              console.log("je donne ton ptn d'xp");
              this.userService.addExp(room.playerA.id, 0.42);
              this.userService.addExp(room.playerB.id, 0.15);
            }
            else if (room.scoreB >= 1) {
              console.log("je donne ton ptn d'xp");
              this.userService.addExp(room.playerB.id, 0.42);
              this.userService.addExp(room.playerA.id, 0.15);
            }
            // console.log("wsh c fini ")
            this.roomRepository.save(room);

            this.roomGateway.emit('roomFinished', room);
            this.roomGateway.emitToRoom(room.id, 'gameEnd', room);
            //this.server.emit('roomFinished', room);
            //this.server.in('room-' + room.id).emit('gameEnd', room);
            const playerA = room.status.split('|')[1];
            const playerB = room.status.split('|')[2];
            if (playerA)
              this.roomGateway.emitToRoom(room.id, 'gameRemoveInvite', { target: playerA, room: room });
            if (playerB)
              this.roomGateway.emitToRoom(room.id, 'gameRemoveInvite', { target: playerB, room: room });
            //clearInterval(intervalList[room.id]);
            //roomList[room.id] = null;
          }
          room.ball.direction = Math.random() * 2 * Math.PI;
          room.ball.x = 50;
          room.ball.y = 50;
          room.ball.speed = room.settings.defaultSpeed;
          this.roomRepository.update(room.id, { ball: room.ball });
          this.roomGateway.emitToRoom(room.id, 'ballMovement', room);
          this.roomGateway.emitToRoom(room.id, 'roomUpdated', room);
        } else {
          // Check collision with playerA and playerB
          const playerA = room.playerA;
          const playerB = room.playerB;
          if (
            room.ball.x + settings.ballRadius > playerA.x &&
            room.ball.x - settings.ballRadius < playerA.x + settings.boardWidth &&
            room.ball.y > playerA.y &&
            room.ball.y < playerA.y + settings.boardHeight
          ) {
            console.log('gameLoop - collision with playerA');
            room.ball.direction = Math.PI - room.ball.direction;
            room.ball.x += room.ball.speed * 0.8 * Math.cos(room.ball.direction);
            room.ball.y += room.ball.speed * 0.8 * Math.sin(room.ball.direction);
            room.ball.speed += 0.15;
          }
          else if (
            room.ball.x - settings.ballRadius < playerB.x + settings.boardWidth &&
            room.ball.x + settings.ballRadius > playerB.x &&
            room.ball.y > playerB.y &&
            room.ball.y < playerB.y + settings.boardHeight
          ) {
            console.log('gameLoop - collision with playerB');
            room.ball.direction = Math.PI - room.ball.direction;
            room.ball.x += room.ball.speed * 0.8 * Math.cos(room.ball.direction);
            room.ball.y += room.ball.speed * 0.8 * Math.sin(room.ball.direction);
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
            room.ball.x += room.ball.speed * 0.8 * Math.cos(room.ball.direction);
            room.ball.y += room.ball.speed * 0.8 * Math.sin(room.ball.direction);
            room.ball.speed += 0.15;
          }
          else {
            room.ball.x += room.ball.speed * 0.2 * Math.cos(room.ball.direction);
            room.ball.y += room.ball.speed * 0.2 * Math.sin(room.ball.direction);
          }
          this.roomGateway.emitToRoom(room.id, 'ballMovement', room);
        }
        room.lastActivity = Date.now();
        this.roomRepository.update(room.id, { ball: room.ball, lastActivity: room.lastActivity });
      }
    }
  }

  async getRoomSpectates(): Promise<Room[]> {
    return await (
      await this.roomRepository.find()
    ).filter((room) => room.status == 'playing');
  }
  async getRooms(): Promise<Room[]> {
    return await this.roomRepository.find();
  }
  async createRoom(room: Room): Promise<Room> {
    // Set speed by configuration and direction by random
    room.ball = {
      x: 50,
      y: 50,
      speed: room.settings.defaultSpeed,
      direction: room.settings.defaultDirection,
    };
    return await this.roomRepository.save(room);
  }
  async getRoom(roomId: string): Promise<Room> {
    return await (this.roomRepository.findOneBy({ id: roomId }));
  }
  async removeFromID(roomId: string): Promise<void> {
    await this.roomRepository.delete(roomId);
  }
  async addPlayer(
    room: Room,
    playerId: string,
    playerName: string,
  ): Promise<Room> {

    /*if (room.playerA !== null && room.playerA.id === playerId)
      throw new Error("Player already in a room");
    else if (room.playerB !== null && room.playerB.id === playerId)
      throw new Error("Player already in a room");*/
    // reactiver` ca
    if (room.playerA === null)
      room.playerA = {
        id: playerId,
        name: playerName,
        status: 'ready',
        x: 0,
        y: 0,
      };
    else if (room.playerB === null)
      room.playerB = {
        id: playerId,
        name: playerName,
        status: 'ready',
        x: 0,
        y: 0,
      };
    else if (room.nbPlayers < 0 || room.nbPlayers >= 2)
      throw new Error('Room is full');
    else throw new Error('Room is full or we are fucked');
    room.nbPlayers++;
    return await this.roomRepository.save(room);
  }
  // save room
  async save(room: Room): Promise<Room> {
    return await this.roomRepository.save(room);
  }
  async getGameOfUser(uuid: string): Promise<Room[]> {
    console.log('getGameOfUser', uuid);
    const tab: Room[] = [];
    const info = (await this.roomRepository.find()).filter(
      (room) =>
        (room.playerA !== null &&
          room.status == 'finished' &&
          room.playerA.id === uuid) ||
        (room.playerB !== null && room.playerB.id === uuid && room.status == 'finished'),
    );
    for (let i = 0; i < info.length; i++) {
      const findA = await this.userService.findUserByUuid(info[i].playerA.id);
      if (findA)
        info[i].playerA.name = findA.username;
      const findB = await this.userService.findUserByUuid(info[i].playerB.id);
      if (findB)
        info[i].playerB.name = findB.username;
      tab.push(
        plainToClass(SendGameHistoryDto, info[i], {
          excludeExtraneousValues: true,
        }),
      );
    }
    for (let j = 0; j < tab.length; j++) {
      if (tab[j] && tab[j + 1] && tab[j].lastActivity < tab[j + 1].lastActivity) {
        let temp = tab[j];
        tab[j] = tab[j + 1];
        tab[j + 1] = temp;
        j = 0;
      }
    }
    //tab.reverse();
    return tab;
  }
}
