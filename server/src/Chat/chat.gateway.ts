import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { IChat, IChatReceive } from "./Interfaces/Chat";

interface IUserJoin {
    channelId: string
    userId: string,
}

@WebSocketGateway(4001, { cors: '*:*'})
export class ChatGateway {

    constructor(private chatService: ChatService) {}

    @WebSocketServer()
    server;

    @SubscribeMessage('connect')
    handleConnect(@MessageBody() data: string): void {
        this.server.emit('connect', data);
    }

    @SubscribeMessage('disconnect')
    async handleDisconnect(@ConnectedSocket() client: Socket) : Promise<void> {
        const sockets = await this.server.in(client.data.channelId).fetchSockets()

        let users = [];
        for (const socket of sockets) {
            users.push({id: socket.id, userId: socket.data.userId, name: socket.data.name, channelId: client.data.room});
        }
       
        this.server.in(client.data.channelId).emit('usersConnected', users);

        client.data.channelId = "";
        client.data.userId = "";
        client.data.name = "";
    }

    @SubscribeMessage('join')
    async handleEvent(@MessageBody() data: IUserJoin, @ConnectedSocket() client: Socket): Promise<void>  {
        client.join(data.channelId);
        
        client.data.userId = data.userId;
        client.data.name = (await this.chatService.getUser(data.userId)).name;
        client.data.channelId = data.channelId;

        this.server.emit('joinFromServer', data);
        const sockets = await this.server.in(data.channelId).fetchSockets()

        let users = [];
        for (const socket of sockets) {
            users.push({id: socket.id, userId: socket.data.userId, name: socket.data.name, channelId: client.data.room});
        }

        this.server.in(data.channelId).emit('usersConnected', users);
    }

    @SubscribeMessage('leave')
    async handleLeave(@MessageBody() data: IUserJoin, @ConnectedSocket() client: Socket): Promise<void> {
        client.leave(data.channelId);

        client.data.channelId = "";

        this.server.emit('leaveFromServer', data);

        const sockets = await this.server.in(data.channelId).fetchSockets()

        let users = [];
        for (const socket of sockets) {
            users.push({id: socket.id, userId: socket.data.userId, name: socket.data.name, channelId: client.data.room});
        }

        this.server.in(data.channelId).emit('usersConnected', users);
    }

    @SubscribeMessage('leavePermanant')
    async handleLeavePermanant(@MessageBody() data: IUserJoin, @ConnectedSocket() client: Socket): Promise<void> {
        
        if (client.data?.channelId === data.channelId) {
            client.leave(data.channelId);
            client.data.channelId = "";
            const sockets = await this.server.in(data.channelId).fetchSockets()

            let users = [];
            for (const socket of sockets) {
                users.push({id: socket.id, userId: socket.data.userId, name: socket.data.name, channelId: client.data.room});
            }

            this.server.in(data.channelId).emit('usersConnected', users);
        }

        this.server.in(data.channelId).emit('updateAllPlayers', await this.chatService.getUsersInfosInChannel(data.channelId));
    }

    @SubscribeMessage('joinPermanent')
    async handleJoinPermanant(@MessageBody() data: {channelId: string}): Promise<void> {
        this.server.in(data.channelId).emit('updateAllPlayers', await this.chatService.getUsersInfosInChannel(data.channelId));
    }

    @SubscribeMessage('message')
    async handleMessage(@MessageBody() data: IChatReceive, @ConnectedSocket() client: Socket): Promise<void> {
        let chat : IChat = {
            id: data.id,
            userId: data.userId,
            message: data.message,
            createdAt: data.createdAt
        }
        await this.chatService.createMessage(chat, data.channelId);
        this.server.in(data.channelId).emit('messageFromServer', data);
    }

    @SubscribeMessage('kick')
    async kick(@MessageBody() data: {channelId: string, target: string}, @ConnectedSocket() client: Socket): Promise<void> {
        this.server.in(data.channelId).emit('kickFromChannel', {target: data.target, channelId: data.channelId});
        this.server.in(data.channelId).emit('updateAllPlayers', await this.chatService.getUsersInfosInChannel(data.channelId));
    }

}