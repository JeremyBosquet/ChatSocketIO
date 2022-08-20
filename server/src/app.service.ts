import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './chat/chat.entity';

@Injectable()
export class AppService {

  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>, 
  ) {}

  async createMessage(chat: Chat): Promise<Chat> {
    return await this.chatRepository.save(chat);
  }

  async getMessages(): Promise<Chat[]> {
    return await (await this.chatRepository.find());
  }

  async getMessageFromRoom(room: string): Promise<Chat[]> {
    return await (await (await this.chatRepository.find()).filter(message => message.room === room));
  }

  getHello(): string {
    return 'Hello World!';
  }
}
