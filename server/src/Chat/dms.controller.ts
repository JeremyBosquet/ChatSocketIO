import { Body, Controller, Get, HttpStatus, Param, Post, Res, ValidationPipe } from '@nestjs/common';
import { DMsService } from './dms.service';
import { ChannelIdDTO, GetMessagesDTO, UserIdDTO } from './Interfaces/ChannelDTO';
import { DmCheckDTO, DmIdDTO, GetMessagesDmDTO } from './Interfaces/DmDTO';

@Controller('api/chat')
export class DMsController {
    constructor(
        private readonly dmsService: DMsService
    ) {}

    @Post('dm') //Get dm where two user
    async getDmWhereTwoUser(@Body(ValidationPipe) body: DmCheckDTO, @Res() res) {
        const dm = await this.dmsService.getAndCreateDmWhereTwoUser(body.user1, body.user2);
        res.json(dm);
    }

    @Get('dm/user/:userId') // Get dms where user is in
    async getDMsWhereUser(@Param(ValidationPipe) param: UserIdDTO, @Res() res) {
        const dms = await this.dmsService.getDMsWhereUser(param.userId);
        res.json(dms);
    }

    @Get('dm/:dmId') //Get dm by id
    async getChannel(@Param(ValidationPipe) param: DmIdDTO, @Res() res) {
        const channels = await this.dmsService.getDm(param.dmId);
        res.json(channels);
    }

    @Get('dm/messages/:dmId/:userId') // Get messages from 
    async getMessagesFromChannel(@Param(ValidationPipe) params: GetMessagesDmDTO, @Res() res) {
        const checkUserIsIn = (channel: any) => {
            const containsUser = channel?.users.filter(user => user.id === params.userId);
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
