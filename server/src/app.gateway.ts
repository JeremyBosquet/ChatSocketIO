import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';

@WebSocketGateway(7003, { cors: '*:*' })
export class AppGateway {
  constructor(private UsersService: UsersService) {}
  @WebSocketServer()
  server: any;

  @SubscribeMessage('connected')
  async connected(@MessageBody() data: any,@ConnectedSocket() client: Socket,): Promise<WsResponse<any>> {
	if (await this.UsersService.findUserByUuid(data.uuid))
	{
		client.data.uuid = data.uuid;
		//this.UsersService.IsLoggedIn(data.uuid)
		const sockets = await this.server.fetchSockets()

        let users = [];
        for (const socket of sockets) {
            users.push({uuid : socket.data.uuid});
        }
		this.server.to(client.id).emit('listUsersConnected', {users : users});
		this.server.emit('connectedToServer', {uuid : data.uuid});
	}
    return;
  }

  @SubscribeMessage('disconnect')
  async disconnect(@MessageBody() data: any,@ConnectedSocket() client: Socket,): Promise<WsResponse<any>> {
	if (await this.UsersService.findUserByUuid(client.data.uuid))
	{
		//this.UsersService.IsntLoggedIn(client.data.uuid);
		this.server.emit('disconnectFromServer', {uuid : client.data.uuid});
		client.data.uuid = null;
	}
    return;
  }

  @SubscribeMessage('addFriend')
  async addFriend(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<any>> {
    this.server.emit('newFriend', {
      uuid: data.uuid,
      username: (await this.UsersService.findUserByUuid(data.myUUID)).username,
    });
    return;
  }

  @SubscribeMessage('stpUneNotif')
  async stpUneNotif(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<any>> {
    this.server.emit('stpUneNotifstpUneNotif');
    return;
  }

  @SubscribeMessage('removeOrBlock')
  async removeOrBlock(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<any>> {
    this.server.emit('removedOrBlocked', {
      uuid: data.uuid,
      username: (await this.UsersService.findUserByUuid(data.myUUID)).username,
    });
    return;
  }

  @SubscribeMessage('acceptFriend')
  async acceptFriend(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<any>> {
    this.server.emit('friendAccepted', {
      uuid: data.uuid,
      username: (await this.UsersService.findUserByUuid(data.myUUID)).username,
      friendUuid: data.myUUID,
    });
    return;
  }

  @SubscribeMessage('CancelFriendAdd')
  async CancelFriendAdd(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<any>> {
    this.server.emit('CancelFriend', {
      uuid: data.uuid,
      username: (await this.UsersService.findUserByUuid(data.myUUID)).username,
    });
    return;
  }

  @SubscribeMessage('DeclineFriendAdd')
  async DeclineFriendAdd(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<any>> {
    this.server.emit('DeclineFriend', {
      uuid: data.uuid,
      username: (await this.UsersService.findUserByUuid(data.myUUID)).username,
    });
    return;
  }
}
