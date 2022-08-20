import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { AppService } from "src/app.service";
import { Chat } from "./chat.entity";

interface IUserJoin {
    name: string,
    room: string
}

interface IMessage {
    name: string,
    room: string,
    message: string,
    date: string
}

@WebSocketGateway(4001, { cors: '*:*'})
export class ChatGateway {

    constructor(private appService: AppService) {}

    @WebSocketServer()
    server;

    @SubscribeMessage('connect')
    handleConnect(@MessageBody() data: string): void {
        this.server.emit('connect', data);
    }

    @SubscribeMessage('disconnect')
    async handleDisconnect(@ConnectedSocket() client: Socket) : Promise<void> {
        const sockets = await this.server.in(client.data.room).fetchSockets()

        let users = [];
        for (const socket of sockets) {
            users.push({id: socket.id, name: socket.data.name, room: client.data.room});
        }
       
        this.server.in(client.data.room).emit('usersConnected', users);

        client.data.room = "";
    }

    @SubscribeMessage('join')
    async handleEvent(@MessageBody() data: IUserJoin, @ConnectedSocket() client: Socket): Promise<void>  {
        client.join(data.room);
        
        client.data.name = data.name;
        client.data.room = data.room;

        this.server.emit('joinFromServer', data);
        const sockets = await this.server.in(data.room).fetchSockets()

        let users = [];
        for (const socket of sockets) {
            users.push({id: socket.id, name: socket.data.name, room: data.room});
        }

        this.server.in(data.room).emit('usersConnected', users);
    }

    @SubscribeMessage('leave')
    async handleLeave(@MessageBody() data: IUserJoin, @ConnectedSocket() client: Socket): Promise<void> {
        client.leave(data.room);

        client.data.room = "";

        this.server.emit('leaveFromServer', data);

        const sockets = await this.server.in(data.room).fetchSockets()

        let users = [];
        for (const socket of sockets) {
            users.push({id: socket.id, name: socket.data.name, room: data.room});
        }

        this.server.in(data.room).emit('usersConnected', users);
    }

    @SubscribeMessage('message')
    async handleMessage(@MessageBody() data: Chat, @ConnectedSocket() client: Socket): Promise<void> {
        await this.appService.createMessage(data);
        this.server.in(data.room).emit('messageFromServer', data);
    }

}