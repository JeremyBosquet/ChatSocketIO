import { IChannelUser } from "./User";
import { IsUUID, IsNotEmpty, IsDateString } from 'class-validator';

export class editChannelPasswordDTO {
    @IsUUID()
    channelId: string;

    @IsNotEmpty()
    newVisibility: string;
    
    newPassword: string;
    oldPassword: string | undefined;

}

export class JoinChannelDTO {
    @IsUUID()
    channelId: string;

    password: string;
}

export class JoinChannelCodeDTO {
    @IsNotEmpty()
    code: string;
}

export class LeaveChannelDTO {
    @IsUUID()
    channelId: string;
}

export class ChannelIdDTO {
    @IsUUID()
    channelId: string;
}

export class UserIdDTO {
    @IsUUID()
    userId: string;
}

export class GetMessagesDTO {
    @IsUUID()
    channelId: string;
}

export class CreateChannelDTO {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    owner: IChannelUser;

    @IsNotEmpty()
    visibility: string;

    mutes: any;
    bans: any;

    password: string;
    users: string;
}

export class ChannelsWhereUserDTO {
    @IsNotEmpty()
    channelContain: string;
}

export class KickPlayerDTO {
    @IsUUID()
    channelId: string;
    
    @IsUUID()
    target: string;
}

export class BanPlayerDTO {
    @IsUUID()
    channelId: string;
    
    @IsUUID()
    target: string;

    @IsNotEmpty()
    isPermanent: boolean;

    @IsDateString()
    time: string;
}

export class MutePlayerDTO {
    @IsUUID()
    channelId: string;
    
    @IsUUID()
    target: string;

    @IsNotEmpty()
    isPermanent: boolean;

    @IsDateString()
    time: string;
}

export class UnmutePlayerDTO {
    @IsUUID()
    channelId: string;
    
    @IsUUID()
    target: string;
}

export class setAdminDTO {
    @IsUUID()
    channelId: string;
    
    @IsUUID()
    target: string;
}

export interface IbanPlayer {
    channelId: string,
    target: string,
    time: undefined
}