import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtTwoFactorGuard } from 'src/2auth/jwt-two-factor.guard';
import { JwtAuthGuard } from 'src/login/guards/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
        private readonly userService: UsersService
    ) {}

    @Get('user/:id')
    @UseGuards(JwtAuthGuard)
    async getUser(@Param() param, @Req() req, @Res() res) {
        const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
        const User = await this.userService.findUserByUuid(Jwt["uuid"]);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        let user = await this.chatService.getUser(param.id);
        let data = {};

        if (!user)
        {
            data = {
                uuid: param.id,
                username: "User deleted",
                trueUsername: "unknow",
                image: ""
            }
        } else
        {
            data = {
                uuid: user.uuid,
                username: user.username,
                trueUsername: user.trueUsername,
                image: user.image,
            }
        }
        res.json(data);
    }
}
