import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { Room } from './Entities/room.entity';
import { SendGameHistoryDto } from './room.dto';

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
      if (list[i].status != 'finished') {
        console.log('Clearing room', list[i].id);
        await this.roomRepository.remove(list[i]);
      } else console.log('Finished room', list[i].id);
    }
    console.log('done');
  }

  constructor(
    @InjectRepository(Room) private roomRepository: Repository<Room>,
  ) {
    this.clearDatabase();
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
        score: 0,
        status: 'ready',
        x: 0,
        y: 0,
      };
    else if (room.playerB === null)
      room.playerB = {
        id: playerId,
        name: playerName,
        score: 0,
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
    for (let i = 0; i < info.length; i++)
      tab.push(
        plainToClass(SendGameHistoryDto, info[i], {
          excludeExtraneousValues: true,
        }),
      );
    tab.reverse();
    return tab;
  }
}