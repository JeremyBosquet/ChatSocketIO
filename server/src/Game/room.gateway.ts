import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { RoomService } from "./room.service";

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

@WebSocketGateway(5002, { cors: '*:*'})
export class RoomGateway {

    constructor(private roomService: RoomService) {}

    @WebSocketServer()
    server;

    @SubscribeMessage('roomCreated')
    async handleConnect(@MessageBody() data: Irooms[]): Promise<void> {
        const rooms = await this.roomService.getRooms();
        this.server.emit('roomCreated', rooms);
    }

    @SubscribeMessage('playerReady')
    async playerReady(@ConnectedSocket() client: Socket, @MessageBody() data: Iready): Promise<void> {
        console.log("playerReady : ", data);
        const room = await this.roomService.getRoom(data.roomId);
        console.log("room : ", room);
        try {
            console.log(data);
            await this.roomService.addPlayer(room, data.playerId, data.playerName);
            //this.server.emit('playerReady', room);
        }
        catch (error) {
            if (error.message === "Room is full") {
                console.log("errorRoomIsFull -", room.id, room.nbPlayers);
                client.emit('errorRoomIsFull', error);
            }
            else if (error.message === "Player already in a room")
            {
                console.log("errorPlayerAlreadyInRoom -", room.id, room.nbPlayers);
                client.emit('errorPlayerAlreadyInRoom', error);
            }
           else
                console.log("error -", error.message);
        }
        finally{
            const room = await this.roomService.getRoom(data.roomId);
            this.server.emit('playerReady', room);
        }
    }
}