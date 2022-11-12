import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService
    ) {}

    @Post('user')
    async createUser(@Res() res, @Body() body) {
        const user = await this.chatService.createUser(body);
        res.json(user);
    }

    @Get('user/:id')
    async getUser(@Param() param, @Res() res) {
        const user = await this.chatService.getUser(param.id);
        res.json(user);
    }
}
