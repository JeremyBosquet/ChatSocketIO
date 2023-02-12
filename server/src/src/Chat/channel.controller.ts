import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { BanPlayerDTO, ChannelIdDTO, ChannelsWhereUserDTO, CreateChannelDTO, editChannelPasswordDTO, GetMessagesDTO, JoinChannelCodeDTO, JoinChannelDTO, KickPlayerDTO, LeaveChannelDTO, MutePlayerDTO, setAdminDTO, UnmutePlayerDTO, UserIdDTO } from './Interfaces/ChannelDTO';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/Users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtTwoFactorGuard } from 'src/TwoFactorAuth/guards/jwt-two-factor.guard';

@Controller('api/chat')
export class ChannelController {
    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
        private readonly userService: UsersService
    ) {}

    @Post('channel')
    @UseGuards(JwtTwoFactorGuard)
    async createChannel(@Req() req: any, @Res() res: any, @Body(ValidationPipe) body: CreateChannelDTO) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        async function passwordHash(password) {
            return await bcrypt.hash(password, 10);
        }

        if (body?.password)
            body.password = await passwordHash(body.password);

        if ((body.name.length > 16 || body.name.length < 3) || body.name.trim().length === 0)
            return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST, message: "Channel name must be between 3 and 16 characters", error: "Bad Request"});

        if (body?.password && body.password.length < 8)
            return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST, message: "Password must be at least 8 characters", error: "Bad Request"});

        const data : any = body;

        if (data?.visibility === "private")
            data.code = await this.chatService.generateCode();
        else
            data.code = "";

        await this.chatService.createChannel(data);
        return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "Channel created"});
    }

    @Post('channel/join')
    @UseGuards(JwtTwoFactorGuard)
    async joinChannel(@Req() req: any, @Res() res: any, @Body(ValidationPipe) body : JoinChannelDTO) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const checkIfUserAlreadyIn = (channel: any) => {
            const containsUser = channel.users.filter(user => user.id === User.uuid);
            if (Object.keys(containsUser).length == 0)
                return false;
            return true;
        }

        if (body?.channelId)
        {
            const channel = await this.chatService.getBrutChannel(body.channelId);
            if (channel)
            {   
                if (channel.visibility === "protected")
                {
                    const result = await bcrypt.compare(body.password, channel.password);
                    if (!channel?.password || result === false)
                        return res.status(HttpStatus.FORBIDDEN).json({statusCode: HttpStatus.FORBIDDEN, message: "Wrong password", error: "Forbidden"});
                    } else if (channel.visibility === "private") 
                        return res.status(HttpStatus.FORBIDDEN).json({statusCode: HttpStatus.FORBIDDEN, message: "Wrong request", error: "Forbidden"});

                const user = {"id": User.uuid, "role": "default"}
                if (channel.users)
                {
                    if (checkIfUserAlreadyIn(channel) === true)
                        return res.status(HttpStatus.CONFLICT).json({statusCode: HttpStatus.CONFLICT, message: "You are already in channel", error: "Conflict"});
                        
                    channel.users = [...channel.users, user];
                }
                    
                if (await this.chatService.userIsBanned(body.channelId, User.uuid))
                {
                    const ban = channel.bans.filter(ban => ban.id === User.uuid)[0];
                    if (ban?.permanent)
                        return res.status(HttpStatus.FORBIDDEN).json({statusCode: HttpStatus.FORBIDDEN, message: "You are permanently banned from this channel", error: "Forbidden"});
                    if (ban?.time > new Date().toISOString())
                        return res.status(HttpStatus.FORBIDDEN).json({statusCode: HttpStatus.FORBIDDEN, message: "You are banned from the channel until " + new Date(ban.time).toLocaleString(), error: "Forbidden"});
                }

                await this.chatService.updateChannel(body.channelId , {users: channel.users});
                return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "You have successfully join the channel"});
            }
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});
        }
        return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST, message: "Bad request", error: "Bad request"});
    }

    @Post('channel/join/code')
    @UseGuards(JwtTwoFactorGuard)
    async joinChannelWithCode(@Req() req : any, @Res() res: any, @Body(ValidationPipe) body : JoinChannelCodeDTO) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const checkIfUserAlreadyIn = (channel: any) => {
            const containsUser = channel.users.filter((user: any) => user.id === User.uuid);
            if (Object.keys(containsUser).length == 0)
                return false;
            return true;
        }

        if (body?.code)
        {
            const channel = await this.chatService.getBrutChannelWithCode(body.code);
            if (channel)
            {   
                const user = {"id": User.uuid, "role": "default"}
                if (channel.users)
                {
                    if (checkIfUserAlreadyIn(channel) === true)
                        return res.status(HttpStatus.CONFLICT).json({statusCode: HttpStatus.CONFLICT, message: "You are already in channel", error: "Conflict"});
                        
                    channel.users = [...channel.users, user];
                }
                    
                if (await this.chatService.userIsBanned(channel.id, User.uuid))
                {
                    const ban = channel.bans.filter(ban => ban.id === User.uuid)[0];
                    if (ban?.permanent)
                        return res.status(HttpStatus.FORBIDDEN).json({statusCode: HttpStatus.FORBIDDEN, message: "You are permanently banned from this channel", error: "Forbidden"});
                    if (ban?.time > new Date().toISOString())
                        return res.status(HttpStatus.FORBIDDEN).json({statusCode: HttpStatus.FORBIDDEN, message: "You are banned from the channel until " + new Date(ban.time).toLocaleString(), error: "Forbidden"});
                }

                await this.chatService.updateChannel(channel.id , {users: channel.users});
                return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "You have successfully join the channel", channelId: channel.id});
            }
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});
        }
        return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST, message: "Bad request", error: "Bad request"});
    }

    @Post('channel/leave')
    @UseGuards(JwtTwoFactorGuard)
    async leaveChannel(@Req() req : any, @Res() res: any, @Body(ValidationPipe) body: LeaveChannelDTO) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const checkIfUserAlreadyIn = (channel: any) => {
            const containsUser = channel.users.filter((user: any) => user.id === User.uuid);
            if (Object.keys(containsUser).length == 0)
                return false;
            return true;
        }

        if (body?.channelId)
        {
            const channel = await this.chatService.getBrutChannel(body.channelId);
            if (channel)
            {
                if (channel.users)
                {
                    if (checkIfUserAlreadyIn(channel) === false)
                        return res.status(HttpStatus.CONFLICT).json({statusCode: HttpStatus.CONFLICT, message: "User not in channel", error: "Conflict"});

                    channel.users = channel.users.filter((user: any) => user.id !== User.uuid);
                }
                if (Object.keys(channel.users).length == 0)
                    await this.chatService.deleteChannel(body.channelId);
                else {
                    const newChannel = await this.chatService.setNewOwner(channel);
                    await this.chatService.updateChannel(body.channelId, newChannel);
                }
                return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "Leave successfully"});
            }
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});
        }
        return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST, message: "Bad request", error: "Bad request"});
    }
    
    @Post('channel/edit') //Edit channel password
    @UseGuards(JwtTwoFactorGuard)
    async editChannel(@Req() req: any, @Res() res: any, @Body(ValidationPipe) body : editChannelPasswordDTO) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        function verifPassword(password: string) {
            if (!password)
                return (false);
            return (true);
        }

        async function passwordHash(password) {
            return await bcrypt.hash(password, 10);
        }

        const channel = await this.chatService.getBrutChannel(body.channelId);
        if (!channel)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});
            
        if (channel.owner.id !== User.uuid)
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
            channel.code = await this.chatService.generateCode();
            await this.chatService.updateChannel(channel.id, channel);
            return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "Visibility set to private", code: channel.code});
        }
        
        if (body.newVisibility === "protected") {
            if (body.newPassword.length < 8)
                return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST, message: "New password must be contain at least 8 characters", error: "Bad request"});
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
    @UseGuards(JwtTwoFactorGuard)
    async getChannel(@Param(ValidationPipe) param: ChannelIdDTO, @Req() req: any, @Res() res: any) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const channels = await this.chatService.getChannel(param.channelId);
        res.status(HttpStatus.OK).json(channels);
    }

    @Get('channels/byname/:channelContain') // Get all channels contains :channelContain where :userId is in
    @UseGuards(JwtTwoFactorGuard)
    async getChannelsWhereUserByName(@Param(ValidationPipe) param: ChannelsWhereUserDTO, @Req() req: any, @Res() res: any) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const channels = await this.chatService.getChannelsWhereUserByName(param.channelContain, User.uuid);
        res.json(channels);
    }

    @Get('channels/user') // Get channels where user is in
    @UseGuards(JwtTwoFactorGuard)
    async getChannelsWhereUser(@Req() req: any, @Res() res: any) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const channels : [] = await this.chatService.getChannelsWhereUser(User.uuid);
        res.status(HttpStatus.OK).json(channels);
    }

    @Get('channels/users/:channelId') // Get users in channel
    @UseGuards(JwtTwoFactorGuard)
    async getChannelsWhereUsers(@Param(ValidationPipe) param: ChannelIdDTO, @Req() req: any, @Res() res: any) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }
        
        const channels = await this.chatService.getUsersInfosInChannel(param.channelId);
        res.json(channels);
    }

    @Get('messages/:channelId') // Get messages from 
    @UseGuards(JwtTwoFactorGuard)
    async getMessagesFromChannel(@Param(ValidationPipe) params: GetMessagesDTO, @Req() req: any, @Res() res: any) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const checkUserIsIn = (channel: any) => {
            const containsUser = channel.users.filter((user : any) => user.id === User.uuid);
            if (Object.keys(containsUser).length == 0)
                return false;
            return true;
        }

        const channel = await this.chatService.getBrutChannel(params.channelId);
        if (!channel)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});

        if (!checkUserIsIn(channel))
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
        
        const messages = await this.chatService.getMessageFromChannel(params.channelId);
        res.json(messages);
    }

    @Get('mutes/:channelId') // Get mutes from channel 
    @UseGuards(JwtTwoFactorGuard)
    async getMutedUsers(@Param(ValidationPipe) params: ChannelIdDTO, @Req() req: any, @Res() res: any) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const channel = await this.chatService.getBrutChannel(params.channelId);
        if (!channel)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});
        
        const muted = await this.chatService.getMutedUsers(channel.uuid);
        res.json(muted);
    }

    @Post('channel/kick') //Kick player from channel
    @UseGuards(JwtTwoFactorGuard)
    async kick(@Body(ValidationPipe) body: KickPlayerDTO, @Req() req: any, @Res() res: any) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const channel = await this.chatService.getBrutChannel(body.channelId);
        if (!channel)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});

        const admin = await this.chatService.getUserInChannel(User.uuid, body.channelId);
        if (!admin)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not found"});

        if (admin.role !== "admin" && admin.role !== "owner")
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
        
        const userToKick = await this.chatService.getUserInChannel(body.target, body.channelId);
        if (!userToKick)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not found"});
        
        if (admin.role === "admin" && (userToKick.role === "owner" || userToKick.role === "admin"))
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});

        channel.users = channel.users.filter((user : any) => user.id !== body.target);

        await this.chatService.updateChannel(channel.id, channel);

        return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "User kicked"});
    }

    @Post('channel/ban') //Ban player from channel
    @UseGuards(JwtTwoFactorGuard)
    async ban(@Body(ValidationPipe) body: BanPlayerDTO, @Req() req: any, @Res() res: any) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const channel = await this.chatService.getBrutChannel(body.channelId);
        if (!channel)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});

        const admin = await this.chatService.getUserInChannel(User.uuid, body.channelId);
        if (!admin)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not found"});
        if (admin.role !== "admin" && admin.role !== "owner")
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
        
        const userToBan = await this.chatService.getUserInChannel(body.target, body.channelId);
        if (!userToBan)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not found"});
        
        if (admin.role === "admin" && (userToBan.role === "owner" || userToBan.role === "admin"))
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            
        channel.users = channel.users.filter((user: any) => user.id !== body.target);
        if (body.isPermanent)
            body.time = "-1";
        channel.bans.push({id: body.target, time: body.time, permanent: body.isPermanent});

        await this.chatService.updateChannel(channel.id, channel);

        return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "User banned" + (body.isPermanent ? " permanently" : "")});
    }
    
    @Post('channel/mute') //mute player from channel
    @UseGuards(JwtTwoFactorGuard)
    async mute(@Body(ValidationPipe) body: MutePlayerDTO, @Req() req: any, @Res() res: any) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const channel = await this.chatService.getBrutChannel(body.channelId);
        if (!channel)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});

        const admin = await this.chatService.getUserInChannel(User.uuid, body.channelId);
        if (!admin)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not found"});
        if (admin.role !== "admin" && admin.role !== "owner")
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
        
        const userToMute = await this.chatService.getUserInChannel(body.target, body.channelId);
        if (!userToMute)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not found"});
        
        if (admin.role === "admin" && (userToMute.role === "owner" || userToMute.role === "admin"))
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});

        if (body.isPermanent)
            body.time = "-1";
        channel.mutes.push({id: body.target, time: body.time, permanent: body.isPermanent});

        await this.chatService.updateChannel(channel.id, channel);

        return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "User muted" + (body.isPermanent ? " permanently" : "")});
    }

    @Post('channel/unmute') //mute player from channel
    @UseGuards(JwtTwoFactorGuard)
    async unmute(@Body(ValidationPipe) body: UnmutePlayerDTO, @Req() req: any, @Res() res: any) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const channel = await this.chatService.getBrutChannel(body.channelId);
        if (!channel)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});

        const admin = await this.chatService.getUserInChannel(User.uuid, body.channelId);
        if (!admin)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not found"});
        if (admin.role !== "admin" && admin.role !== "owner")
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
        
        const userToUnmute = await this.chatService.getUserInChannel(body.target, body.channelId);
        if (!userToUnmute)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not found"});

        if (admin.role === "admin" && (userToUnmute.role === "owner" || userToUnmute.role === "admin"))
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            
        channel.mutes = channel.mutes.filter((user : any) => user.id !== body.target);
        await this.chatService.updateChannel(channel.id, channel);

        return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "User unmuted"});
    }


    @Post('channel/setadmin') //set player to admin from channel
    @UseGuards(JwtTwoFactorGuard)
    async setAdmin(@Body(ValidationPipe) body: setAdminDTO, @Req() req: any, @Res() res: any) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const channel = await this.chatService.getBrutChannel(body.channelId);
        if (!channel)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});

        const owner = await this.chatService.getUserInChannel(User.uuid, body.channelId);
        if (!owner)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not found"});
        if (owner.role !== "owner")
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
        
        const userToSetAdmin = await this.chatService.getUserInChannel(body.target, body.channelId);
        if (!userToSetAdmin)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not found"});

        channel.users = channel.users.map(user => {
            if (user.id === body.target)
                user.role = "admin";
            return user;
        });
        await this.chatService.updateChannel(channel.id, {users: channel.users});

        return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "User promoted to admin"});
    }

    @Post('channel/unsetadmin') //set player to admin from channel
    @UseGuards(JwtTwoFactorGuard)
    async unsetAdmin(@Body(ValidationPipe) body: setAdminDTO, @Req() req: any, @Res() res: any) {
        const User = await this.userService.findUserByUuid(req.user.uuid);
        
        if (!User)
        {
            res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
            return ;
        }

        const channel = await this.chatService.getBrutChannel(body.channelId);
        if (!channel)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "Channel not found", error: "Not found"});

        const owner = await this.chatService.getUserInChannel(User.uuid, body.channelId);
        if (!owner)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not found"});
        if (owner.role !== "owner")
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED, message: "User not permitted", error: "Unauthorized"});
        
        const userToUnsetAdmin = await this.chatService.getUserInChannel(body.target, body.channelId);
        if (!userToUnsetAdmin)
            return res.status(HttpStatus.NOT_FOUND).json({statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not found"});

        channel.users = channel.users.map(user => {
            if (user.id === body.target)
                user.role = "default";
            return user;
        });
        await this.chatService.updateChannel(channel.id, {users: channel.users});

        return res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK, message: "User downgraded to default"});
    }
}
