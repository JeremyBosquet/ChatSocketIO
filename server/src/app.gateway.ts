import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { AppService } from "./app.service";
import { UsersService } from "./users/users.service";

@WebSocketGateway(7003, {cors : '*:*'})
export class AppGateway {
    constructor(private UsersService: UsersService) {
    }
    @WebSocketServer()
    server : any;

    @SubscribeMessage('addFriend')
    async addFriend(@MessageBody() data: any, @ConnectedSocket() client: any): Promise<WsResponse<any>> {
        this.server.emit('newFriend', {uuid: data.uuid, username: ((await this.UsersService.findUserByUuid(data.myUUID)).username)});
        return ;
    }

	@SubscribeMessage('acceptFriend')
    async acceptFriend(@MessageBody() data: any, @ConnectedSocket() client: any): Promise<WsResponse<any>> {
        this.server.emit('friendAccepted', {uuid: data.uuid, username: ((await this.UsersService.findUserByUuid(data.myUUID)).username)});
        return ;
    }

	@SubscribeMessage('CancelFriendAdd')
    async CancelFriendAdd(@MessageBody() data: any, @ConnectedSocket() client: any): Promise<WsResponse<any>> {
        this.server.emit('CancelFriend', {uuid: data.uuid, username: ((await this.UsersService.findUserByUuid(data.myUUID)).username)});
        return ;
    }
}

