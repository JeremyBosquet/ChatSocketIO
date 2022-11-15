import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService
    ) {}

    @Get('user/:id')
    async getUser(@Param() param, @Res() res) {
        let user = await this.chatService.getUser(param.id);
        let data = {};
        if (!user)
        {
            data = {
                uuid: param.id,
                username: "User deleted",
                image: ""
            }
        } else
        {
            data = {
                uuid: user.uuid,
                username: user.username,
                image: user.image,
            }
        }
        res.json(data);
    }
}
