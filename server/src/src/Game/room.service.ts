import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { InformationEvent } from 'http';
//import { Interval } from '@nestjs/schedule';
import { UsersService } from 'src/users/users.service';
import { In, Repository } from 'typeorm';
import { Room } from './Entities/room.entity';
import { SendGameHistoryDto } from './room.dto';
import { RoomGateway } from './room.gateway';

let lastTime = Date.now();
let averageTime = 0;
const lasttimestamp = [];

const roomList = [];
@Injectable()
export class RoomService {
  //@Interval(1000)
  //async update() {
  //  console.log("RoomList", roomList, roomList.length);
  //  for(let i = 0; i < roomList.length; i++)
  //  {
  //    console.log("Room", roomList[i].status);
  //  }
  //}
  async checkDatabase() {
    const list = await this.roomRepository.find();
    for (let i = 0; i < list.length; i++) {
      if (list[i].status != 'finished') {
        // Pas sur que ca sois utile
      }
    }
  }
  async clearDatabase() {
    console.log('Clear database in progress :');
    const list = await this.roomRepository.find();
    for (let i = 0; i < list.length; i++) {
      if (list[i].status != 'finished' && list[i].status != 'destroy') {
        //console.log('Clearing room', list[i].id);
        await this.roomRepository.remove(list[i]);
      } //else console.log('Finished room', list[i].id);
    }
    //console.log('done');
  }

  constructor(
    @InjectRepository(Room) private roomRepository: Repository<Room>,
    private readonly userService: UsersService,
    //private readonly roomGateway: RoomGateway,
  ) {
    this.clearDatabase();
  }
  async updateRoom(roomId: string, data: any): Promise<any> {
    if (roomList.findIndex((_room) => _room.id == roomId) != -1) {
      const _index = roomList.findIndex((_room) => _room.id == roomId);
      roomList[_index] = { ...roomList[_index], ...data };
    }
    else
    {
      roomList.push({...await this.roomRepository.findOneBy({ id: roomId }), ...data });
      await this.roomRepository.update(roomId, data);
    }

    //return roomList[roomId] = { ...roomList[roomId], ...data };
    //return await this.roomRepository.update(roomId, data);
  }

  async getRoomSpectates(): Promise<Room[]> {
    //return await this.roomRepository.find();
    if (roomList.length > 0) 
    {
      const _roomList = roomList.filter((room) => room.status == 'playing');
      return _roomList;
    }
    else {
      const _roomList = await (  await this.roomRepository.find()).filter((room) => room.status == 'playing');
      return _roomList;
    }
  }

  async getRooms(): Promise<Room[]> {
    if (roomList.length > 0) return roomList;
    else return await this.roomRepository.find();
    //return await this.roomRepository.find();
  }
  async createRoom(room: Room): Promise<Room> {
    // Set speed by configuration and direction by random
    room.ball = {
      x: 50,
      y: 50,
      speed: room.settings.defaultSpeed,
      direction: room.settings.defaultDirection,
    };
    roomList.push(room);
    return await this.roomRepository.save(room);
  }
  async getRoom(roomId: string): Promise<Room> {
    if (roomList.findIndex((_room) => _room.id == roomId) != -1) return roomList[roomList.findIndex((_room) => _room.id == roomId)];
    else return await (this.roomRepository.findOneBy({ id: roomId }));
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
    roomList[room.id] = room;
    return await this.roomRepository.save(room);
  }
  // save room
  async save(room: Room): Promise<Room> {
    //roomList[room.id] = room;
    if (roomList.findIndex((_room) => _room.id == room.id) != -1) {
      const _index = roomList.findIndex((_room) => _room.id == room.id);
      roomList[_index] = room;
    }
    else
    {
      roomList.push(room);
    }
    return await this.roomRepository.save(room);
  }
  async getGameOfUser(uuid: string): Promise<Room[]> {
    //console.log('getGameOfUser', uuid);
    const tab: Room[] = [];
    const info = (await this.roomRepository.find()).filter(
      (room) =>
        (room.playerA !== null &&
          room.status == 'finished' &&
          room.playerA.id === uuid) ||
        (room.playerB !== null && room.playerB.id === uuid && room.status == 'finished'),
    );
    for (let i = 0; i < info.length; i++) {
      if (info[i].playerA?.id && info[i].playerB.id)
      {
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
    }
	// return tab sorted from bigger tab.LastActivity to smaller tab.LastActivity
	return tab.sort((a, b) => b.lastActivity - a.lastActivity);


    //tab.reverse();
    return tab;
  }
}
