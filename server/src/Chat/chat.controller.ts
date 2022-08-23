import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { AppService } from '../app.service';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService
    ) {}

    @Post('user')
    async createUser(@Res() res, @Body() body, @Param() params) {
        console.log(body);
        const user = await this.chatService.createUser(body.user);
        res.json(user);
    }

    @Post('channel')
    async createChannel(@Res() res, @Param() params) {
        const channel = await this.chatService.createChannel(params.channel);
        res.json(channel);
    }

    @Get('messages')
    async getMessages(@Res() res) {
        const messages = await this.chatService.getMessages();
        res.json(messages);
    }

    @Get('messages/:room')
    async getMessagesFromRoom(@Res() res, @Param() params) {
        const messages = await this.chatService.getMessageFromRoom(params.room);
        res.json(messages);
    }
}
