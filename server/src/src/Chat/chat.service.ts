import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserModel } from "src/typeorm";
import { Repository } from "typeorm";
import { Channel } from "./Entities/channel.entity";
// import { User } from "./Entities/user.entity";
import { IChat } from "./Interfaces/Chat";

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Channel) private channelRepository: Repository<Channel>,
		@InjectRepository(UserModel) private userRepository: Repository<UserModel>,
	) { }

	async createMessage(chat: IChat, channelId: string): Promise<void> {
		const channel = await this.channelRepository.findOneBy({ id: channelId });
		if (channel) {
			channel.messages.push(chat);
			await this.channelRepository.update(channelId, channel);
		}
	}

	async getMessageFromChannel(channelId: string): Promise<IChat[]> {
		return (await this.channelRepository.findOneBy({ id: channelId }))?.messages;
	}

	async createChannel(channel: Channel): Promise<Channel> {
		return await this.channelRepository.save(channel);
	}

	async getChannel(channelId: string): Promise<any> {
		let channelInfos;
		channelInfos = await this.channelRepository.findOneBy({ id: channelId });
		if (channelInfos)
			channelInfos.users = await this.getUsersInfosInChannel(channelId);
		return channelInfos
	}

	async getBrutChannel(channelId: string): Promise<any> {
		return await this.channelRepository.findOneBy({ id: channelId });
	}

	async getBrutChannelWithCode(code: string): Promise<any> {
		return await this.channelRepository.findOneBy({ code: code });
	}

	async getChannels(): Promise<Channel[]> {
		return await this.channelRepository.find();
	}

	async getChannelsWhereUserByName(name: string, userId: string): Promise<Channel[]> {
		function containsPlayer(users: any) {
			const containsUser = users.filter(user => user.id === userId);

			if (Object.keys(containsUser).length == 0)
				return false;
			return true;
		}

		const containsName = (e: string) => {
			if (e.includes(name))
				return true;
			return false;
		}

		const channels = await this.channelRepository.find();
		return (channels.filter(channel => (channel.visibility !== "private" && containsName(channel.name) && !containsPlayer(channel.users)) === true));
	}

	async getChannelsWhereUser(userId: string): Promise<any> {
		function containsPlayer(users: any) : boolean{
			const containsUser = users.filter(user => user.id === userId);

			if (Object.keys(containsUser).length == 0)
				return false;
			return true;
		}
		
		const channels = await this.channelRepository.find();
		return (channels.filter(channel => containsPlayer(channel.users) === true));
	}

	async getUsersInfosInChannel(channelId: string): Promise<any> {
		const channel = await this.channelRepository.findOneBy({ id: channelId });

		let users = [];
		if (channel?.users) {
			for (const user of channel.users) {
				let userInfos: any = await this.getUser(user.id);
				if (userInfos) {
					userInfos["role"] = user.role;
				} else
					userInfos = { user: user.id, username: "User deleted", role: user.role, print: false };
				users.push(userInfos);
			}
		}

		return users;
	}


	async updateChannel(channelId: string, data: any): Promise<any> {
		return await this.channelRepository.update(channelId, data);
	}

	async deleteChannel(channelId: string): Promise<any> {
		return await this.channelRepository.delete(channelId);
	}

	async getUser(userId: string): Promise<UserModel> {
		const user = await this.userRepository.findOneBy({ uuid: userId });
		if (user) {
			let userInfos: any = {
				uuid: user.uuid,
				username: user.username,
				trueUsername: user.trueUsername,
				image: user.image
			};

			return (userInfos)
		}
		return user;
	}

	async getUserInChannel(userId: string, channelId: string): Promise<any> {
		function containsPlayer(users: any) {
			const containsUser = users.filter(user => user.id === userId);

			if (Object.keys(containsUser).length == 0)
				return false;
			return true;
		}

		const channel = await this.channelRepository.findOneBy({ id: channelId });
		if (channel && containsPlayer(channel.users))
			return channel.users.filter(user => user.id === userId)[0];
		return [];
	}

	async getMutedUsers(channelId: string): Promise<any> {
		const channel = await this.channelRepository.findOneBy({ id: channelId });
		if (channel)
			return channel.mutes;
		return [];
	}

	async userIsInChannel(channelId: string, userId: string): Promise<Boolean> {
		const channel = await this.channelRepository.findOneBy({ id: channelId });

		const checkUserIsIn = async (channel: any) => {
			const containsUser = await channel.users.filter((user: any) => user.id === userId);
			if (Object.keys(containsUser).length == 0)
				return false;
			return true;
		}

		return (channel && checkUserIsIn(channel));
	}

	async userIsBanned(channelId: string, userId: string): Promise<Boolean> {
		const channel = await this.channelRepository.findOneBy({ id: channelId });

		if (channel?.bans.filter(ban => ban.id === userId).length > 0) {
			const ban = channel.bans.filter(ban => ban.id === userId)[0];

			if (ban && ban?.time < new Date().toISOString() && !ban.permanent) {
				channel.bans = channel.bans.filter(ban => ban.id !== userId);
				await this.updateChannel(channelId, { bans: channel.bans });

				return false;
			}
			return true;
		}
		return false;
	}

	async userIsMuted(channelId: string, userId: string): Promise<Boolean> {
		const channel = await this.channelRepository.findOneBy({ id: channelId });

		if (channel?.mutes.filter(mute => mute.id === userId).length > 0) {
			const mute = channel.mutes.filter(mute => mute.id === userId)[0];

			if (mute && mute?.time < new Date().toISOString() && !mute.permanent) {
				channel.mutes = channel.mutes.filter(mute => mute.id !== userId);
				await this.updateChannel(channelId, { mutes: channel.mutes });

				return false;
			}
			return true;
		}
		return false;
	}

	async generateCode(): Promise<Number> {
		let min = 100000;
		let max = 999999;
		let code = Math.floor(Math.random() * (max - min + 1)) + min;
		const channel = await this.channelRepository.findOneBy({ code: code.toString() });
		if (channel)
			return await this.generateCode();
		return (code);
	}


}
