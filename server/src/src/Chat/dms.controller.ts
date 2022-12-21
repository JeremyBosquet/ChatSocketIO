import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtTwoFactorGuard } from 'src/2auth/jwt-two-factor.guard';
import { UsersService } from 'src/users/users.service';
import { DMsService } from './dms.service';
import { ChannelIdDTO, GetMessagesDTO, UserIdDTO } from './Interfaces/ChannelDTO';
import { DmCheckDTO, DmIdDTO, GetMessagesDmDTO } from './Interfaces/DmDTO';

@Controller('api/chat')
export class DMsController {
    constructor(
        private readonly dmsService: DMsService,
        private readonly jwtService: JwtService,
        private readonly userService: UsersService
    ) {}

    @Post('dm') //Get dm where two user
    @UseGuards(JwtTwoFactorGuard)
    async getDmWhereTwoUser(@Body(ValidationPipe) body: DmCheckDTO, @Req() req : any, @Res() res: any) {
        const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
        const User = await this.userService.findUserByUuid(Jwt["uuid"]);
        if (User.uuid == body.user1 || User.uuid == body.user2)
        {
            const dm = await this.dmsService.getAndCreateDmWhereTwoUser(body.user1, body.user2);
            res.json(dm);
        } else {
            res.json("nop");
        }

    }

    @Get('dm/user/:userId') // Get dms where user is in
    @UseGuards(JwtTwoFactorGuard)
    async getDMsWhereUser(@Param(ValidationPipe) param: UserIdDTO, @Res() res) {
        const dms = await this.dmsService.getDMsWhereUser(param.userId);
        res.json(dms);
    }

    @Get('dm/:dmId') //Get dm by id
    @UseGuards(JwtTwoFactorGuard)
    async getChannel(@Param(ValidationPipe) param: DmIdDTO, @Res() res) {
        const channels = await this.dmsService.getDm(param.dmId);
        res.json(channels);
    }

    @Get('dm/messages/:dmId/:userId') // Get messages from 
    @UseGuards(JwtTwoFactorGuard)
    async getMessagesFromChannel(@Param(ValidationPipe) params: GetMessagesDmDTO, @Res() res) {
        const checkUserIsIn = (channel: any) => {
            const containsUser = channel?.users.filter((user: any) => user.uuid === params.userId);
            if (Object.keys(containsUser).length == 0)
                return false;
            return true;
        }

        const dm = await this.dmsService.getDm(params.dmId);
        if (!dm)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "dm not found", error: "Not found"});

        if (!checkUserIsIn(dm))
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
        
        const messages = await this.dmsService.getMessageFromDm(params.dmId);
        res.json(messages);
    }
}
