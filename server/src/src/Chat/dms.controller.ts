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
        const user = await this.userService.findUserByUuid(Jwt["uuid"]);

        if (user && user.uuid == body.user1 || user.uuid == body.user2)
        {
            const dm = await this.dmsService.getAndCreateDmWhereTwoUser(body.user1, body.user2);
            res.status(HttpStatus.OK).json(dm);
        } else {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
        }
    }


    //edit and remove :userId
    @Get('dm/user') // Get dms where user is in
    @UseGuards(JwtTwoFactorGuard)
    async getDMsWhereUser(@Req() req : any, @Res() res) {
        const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
        const User = await this.userService.findUserByUuid(Jwt["uuid"]);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const dms = await this.dmsService.getDMsWhereUser(User.uuid);
        res.status(HttpStatus.OK).json(dms);
    }

    @Get('dm/:dmId') //Get dm by id
    @UseGuards(JwtTwoFactorGuard)
    async getDm(@Param(ValidationPipe) param: DmIdDTO, @Req() req : any, @Res() res) {
        const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
        const User = await this.userService.findUserByUuid(Jwt["uuid"]);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const dm = await this.dmsService.getDm(param.dmId);
        res.status(HttpStatus.OK).json(dm);
    }

    //remove userId
    @Get('dm/messages/:dmId') // Get messages from 
    @UseGuards(JwtTwoFactorGuard)
    async getMessagesFromChannel(@Param(ValidationPipe) params: DmIdDTO, @Req() req: any, @Res() res) {
        const Jwt = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
        const User = await this.userService.findUserByUuid(Jwt["uuid"]);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const checkUserIsIn = (channel: any) => {
            const containsUser = channel?.users.filter((user: any) => user.uuid === User.uuid);
            if (Object.keys(containsUser).length == 0)
                return false;
            return true;
        }

        const dm = await this.dmsService.getDm(params.dmId);
        if (!dm)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Dm not found", error: "Not found"});

        if (!checkUserIsIn(dm))
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
        
        const messages = await this.dmsService.getMessageFromDm(params.dmId);
        res.json(messages);
    }
}
