import { Body, Controller, Get, HttpStatus, Param, Post, Res, ValidationPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChannelIdDTO, ChannelsWhereUserDTO, CreateChannelDTO, editChannelPasswordDTO, JoinChannelDTO, LeaveChannelDTO, UserIdDTO } from './Interfaces/ChannelDTO';
import * as bcrypt from 'bcrypt';

@Controller('api/chat')
export class ChannelController {
    constructor(
        private readonly chatService: ChatService
    ) {}

    @Post('channel')
    async createChannel(@Res() res, @Body(ValidationPipe) body: CreateChannelDTO) {
        async function passwordHash(password) {
            return await bcrypt.hash(password, 10);
        }

        if (body?.password)
            body.password = await passwordHash(body.password);

        const data : any = body;

        await this.chatService.createChannel(data);
        return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "Channel created"});
    }

    @Post('channel/join')
    async joinChannel(@Res() res, @Body(ValidationPipe) body : JoinChannelDTO) {
        
        const checkIfUserAlreadyIn = (channel: any) => {
            const containsUser = channel.users.filter(user => user.id === body.userId);
            if (Object.keys(containsUser).length == 0)
                return false;
            return true;
        }

        if (body?.channelId && body?.userId)
        {
            const channel = await this.chatService.getBrutChannel(body.channelId);
            if (channel)
            {   
                if (channel.visibility === "protected")
                {
                    const result = await bcrypt.compare(body.password, channel.password);
                    if (!channel?.password || result === false)
                    return res.status(HttpStatus.FORBIDDEN).json({statusCode: HttpStatus.FORBIDDEN, message: "Wrong password", error: "Forbidden"});
                }

                let user = {"id": body.userId, "role": "default"}
                if (channel.users)
                {
                    if (checkIfUserAlreadyIn(channel) === true)
                        return res.status(HttpStatus.CONFLICT).json({statusCode: HttpStatus.CONFLICT, message: "User already in channel", error: "Conflict"});

                    channel.users = [...channel.users, user];
                }
                await this.chatService.updateChannel(body.channelId , channel);
                return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "Join successfully"});
            }
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});
        }
        return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST, message: "Bad request", error: "Bad request"});
    }

    @Post('channel/leave')
    async leaveChannel(@Res() res, @Body(ValidationPipe) body: LeaveChannelDTO) {
        const checkIfUserAlreadyIn = (channel: any) => {
            const containsUser = channel.users.filter(user => user.id === body.userId);
            if (Object.keys(containsUser).length == 0)
                return false;
            return true;
        }

        if (body?.channelId && body?.userId)
        {
            const channel = await this.chatService.getBrutChannel(body.channelId);
            if (channel)
            {
                if (channel.users)
                {
                    if (checkIfUserAlreadyIn(channel) === false)
                        return res.status(HttpStatus.CONFLICT).json({statusCode: HttpStatus.CONFLICT, message: "User not in channel", error: "Conflict"});

                    channel.users = channel.users.filter(user => user.id !== body.userId);
                }
                if (Object.keys(channel.users).length == 0)
                    await this.chatService.deleteChannel(body.channelId);
                else
                    await this.chatService.updateChannel(body.channelId, channel);
                    return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "Leave successfully"});
                }
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});
        }
        return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST, message: "Bad request", error: "Bad request"});
    }
    
    @Post('channel/edit') //Edit channel password
    async editChannel(@Res() res, @Body(ValidationPipe) body : editChannelPasswordDTO) {
        function verifPassword(password: string) {
            if (!password)
                return (false);
            return (true);
        }

        async function passwordHash(password) {
            return await bcrypt.hash(password, 10);
        }

        const channel = await this.chatService.getChannel(body.channelId);
        if (!channel)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});
            
        if (channel.owner.id !== body.userId)
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});

        if (channel.visibility === "protected")
            if (await bcrypt.compare(body.oldPassword, channel.password) === false)
                return res.status(HttpStatus.FORBIDDEN).json({statusCode: HttpStatus.FORBIDDEN, message: "Wrong password", error: "Forbidden"});

        if (body.newVisibility !== "protected" && body.newVisibility !== "private" && body.newVisibility !== "public")
            return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST, message: "Channel visibility is not valid", error: "Bad request"});

        if (body.newVisibility === "public") {
            if (channel.visibility === "public")
                return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "Visibility already public"});
            channel.visibility = "public"
            channel.password = "";
            await this.chatService.updateChannel(channel.id, channel);
            return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "Visibility set to public"});
        }
        
        if (body.newVisibility === "private") {
            if (channel.visibility === "private")
                return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "Visibility already private"});
            
            channel.visibility = "private";
            channel.password = "";
            await this.chatService.updateChannel(channel.id, channel);
            return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "Visibility set to private"});
        }
        
        if (body.newVisibility === "protected") {
            if (!verifPassword(body.oldPassword)) {
                if (verifPassword(body.newPassword)) {
                    channel.password = await passwordHash(body.newPassword);
                    channel.visibility = "protected";
                    await this.chatService.updateChannel(channel.id, channel);
                    return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "Visibility set to protected"});
                }
                return res.status(HttpStatus.NO_CONTENT).json({statusCode: HttpStatus.NO_CONTENT, message: "New password is empty", error: "No content"});
            } else if (await bcrypt.compare(body.oldPassword, channel.password))  {
                if (verifPassword(body.newPassword)) {
                    channel.password = await passwordHash(body.newPassword);
                    await this.chatService.updateChannel(channel.id, channel);
                    return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "Password updated"});
                }
                return res.status(HttpStatus.NO_CONTENT).json({statusCode: HttpStatus.NO_CONTENT, message: "New password is empty", error: "No content"});
            } else
                return res.status(HttpStatus.FORBIDDEN).json({statusCode: HttpStatus.FORBIDDEN, message: "Wrong password", error: "Forbidden"});
        }

        return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST, message: "Bad request", error: "Bad request"});
    }

    @Get('channel/:channelId') //Get channel by id
    async getChannel(@Param(ValidationPipe) param: ChannelIdDTO, @Res() res) {
        const channels = await this.chatService.getChannel(param.channelId);
        res.json(channels);
    }

    @Get('channels/byname/:channelContain/:userId') // Get all channels contains :channelContain where :userId is in
    async getChannelsWhereUserByName(@Param(ValidationPipe) param: ChannelsWhereUserDTO, @Res() res) {
        const channels = await this.chatService.getChannelsWhereUserByName(param.channelContain, param.userId);
        res.json(channels);
    }

    @Get('channels/user/:userId') // Get channels where user is in
    async getChannelsWhereUser(@Param(ValidationPipe) param: UserIdDTO, @Res() res) {
        const channels = await this.chatService.getChannelsWhereUser(param.userId);
        res.json(channels);
    }

    @Get('channels/users/:channelId') // Get users in channel
    async getChannelsWhereUsers(@Param(ValidationPipe) param: ChannelIdDTO, @Res() res) {
        const channels = await this.chatService.getUsersInfosInChannel(param.channelId);
        res.json(channels);
    }

    @Get('messages/:channelId') // Get messages from 
    async getMessagesFromChannel(@Param(ValidationPipe) params: ChannelIdDTO, @Res() res) {
        const messages = await this.chatService.getMessageFromChannel(params.channelId);
        res.json(messages);
    }
}
