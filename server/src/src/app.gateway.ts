import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RoomService } from './Game/room.service';
import { UsersService } from './Users/users.service';

@WebSocketGateway(7003, { cors: '*:*' })
export class AppGateway {
	constructor(private UsersService: UsersService, private RoomService: RoomService) { }
	@WebSocketServer()
	server: any;

	@SubscribeMessage('connected')
	async connected(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<WsResponse<any>> {
		let myUser = await this.UsersService.findUserByUuid(data.uuid);
		if (myUser) {
			client.data.uuid = data.uuid;
			const sockets = await this.server.fetchSockets()

			let users = [];
			for (const socket of sockets) {
				if (socket.data.uuid)
					if (!(await users.find((user) => (user.uuid === socket.data.uuid))))
						users.push({ uuid: socket.data.uuid });
			}
			this.server.emit('listUsersConnected', { users: users });
			this.server.emit('playing', { users: await this.RoomService.getInGamePlayers() });
		}
		return;
	}

	@SubscribeMessage('joinGame')
	async joinGame(@MessageBody() data: any, @ConnectedSocket() client: Socket,): Promise<WsResponse<any>> {
		let myUser = await this.UsersService.findUserByUuid(client.data.uuid);
		if (myUser)
			this.server.emit('playing', { users: await this.RoomService.getInGamePlayers() });
		return;
	}

	@SubscribeMessage('leaveGame')
	async leaveGame(@MessageBody() data: any, @ConnectedSocket() client: Socket,): Promise<WsResponse<any>> {
		let myUser = await this.UsersService.findUserByUuid(client.data.uuid);
		if (myUser)
			this.server.emit('notPlaying', { users: await this.RoomService.getInGamePlayers() });
		return;
	}

	@SubscribeMessage('disconnect')
	async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
		if (client.data.uuid)
			if (await this.UsersService.findUserByUuid(client.data.uuid)) {
				this.server.emit('disconnectFromServer', { uuid: client.data.uuid });
				client.data.uuid = "";
			}
	}

	@SubscribeMessage('logout')
	async handleLogout(@ConnectedSocket() client: Socket): Promise<void> {
		if (client.data.uuid)
			if (await this.UsersService.findUserByUuid(client.data.uuid)) {
				this.server.emit('disconnectFromServer', { uuid: client.data.uuid });
				client.data.uuid = "";
			}
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

	@SubscribeMessage('Unblock')
	async Unblock(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket,
	): Promise<WsResponse<any>> {
		this.server.emit('Unblocked', {
			uuid: data.uuid,
			username: (await this.UsersService.findUserByUuid(data.myUUID)).username,
		});
		return;
	}

	@SubscribeMessage('Block')
	async Block(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket,
	): Promise<WsResponse<any>> {
		this.server.emit('Block', {
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
