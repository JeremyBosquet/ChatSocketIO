import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { AppService } from '../app.service';
import { ChatService } from './chat.service';
import { IcreateChannel } from './Interfaces/Channels';

@Controller('api/chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService
    ) {}

    @Post('user')
    async createUser(@Res() res, @Body() body) {
        const user = await this.chatService.createUser(body.user);
        res.json(user);
    }

    @Post('channel')
    async createChannel(@Res() res, @Body() body) {
        if (body?.password)
            body.password = body.password; // need bcrypt encryption

        if (body?.users)
            body.users = JSON.stringify(body.users);
        
        if (body?.user)
            body.user = JSON.stringify(body.user);
        
        const channel : IcreateChannel = await this.chatService.createChannel(body);
        res.json(channel);
    }

    @Get('channel')
    async getChannels(@Res() res) {
        const channels = await this.chatService.getChannels();
        res.json(channels);
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
