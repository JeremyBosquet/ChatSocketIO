import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Channel } from "./Entities/channel.entity";
import { Chat } from "./Entities/chat.entity";
import { User } from "./Entities/user.entity";

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Chat) private chatRepository: Repository<Chat>, 
        @InjectRepository(Channel) private channelRepository: Repository<Channel>, 
        @InjectRepository(User) private userRepository: Repository<User>, 
      ) {}

      async createMessage(chat: Chat): Promise<Chat> {
        return await this.chatRepository.save(chat);
      }

      async getMessages(): Promise<Chat[]> {
        return await this.chatRepository.find();
      }
    
      async getMessageFromRoom(room: string): Promise<Chat[]> {
        return await (await this.chatRepository.find()).filter(message => message.room === room);
      }

      async createChannel(channel: Channel): Promise<Channel> {
        return await this.channelRepository.save(channel);
      }
    
      async getChannels(): Promise<Channel[]> {
        return await this.channelRepository.find();
      }

      // async getChannelsWhereUser(userId: string): Promise<Channel[]> {
      //   return await (await this.channelRepository.find()).filter(channel => channel.users.id === userId);
      // }

      async createUser(user: User): Promise<User> {
        console.log("Hola: ", user);
        return await this.userRepository.save(user);
      }
    
}