import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Room } from "./Entities/room.entity";

@Injectable()
export class RoomService {
    constructor(
      @InjectRepository(Room) private roomRepository : Repository<Room>, 
        
      ) {}  
      async getRooms(): Promise<Room[]> {
        return await this.roomRepository.find();
      }
      async createRoom(room: Room): Promise<Room> {
        return await this.roomRepository.save(room);
      }
      async getRoom(roomId: string): Promise<Room> {
        return await (await this.roomRepository.find()).filter(room => room.id === roomId)[0];
      }
      async addPlayer(room: Room, playerId: string, playerName: string): Promise<Room> {
        console.log("addPlayer -", room.id, room.nbPlayers, playerId, playerName);
        
        console.log("playerA: ", room.playerA);
        console.log("playerB: ", room.playerB);

        if (room.playerA !== null && room.playerA.id === playerId)
          throw new Error("Player already in a room");
        else if (room.playerB !== null && room.playerB.id === playerId)
          throw new Error("Player already in a room");
        if (room.playerA === null)
          room.playerA = { id: playerId, name: playerName, score: 0, status: "ready" };
        else if (room.playerB === null) 
          room.playerB = ({id: playerId, name: playerName, score: 0, status: "ready"});
        else if (room.nbPlayers < 0 || room.nbPlayers >= 2)
          throw new Error("Room is full");
        else
          throw new Error("Room is full or we are fucked");
        room.nbPlayers++;
        return await this.roomRepository.save(room);
      } 
}