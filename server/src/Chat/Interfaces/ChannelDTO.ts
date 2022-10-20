import { IChannelUser } from "./User";
import { IsUUID, IsNotEmpty, MinLength, MaxLength, IsDateString } from 'class-validator';

export class editChannelPasswordDTO {
    @IsUUID()
    channelId: string;

    @IsUUID()
    userId: string;

    @IsNotEmpty()
    newVisibility: string;
    
    newPassword: string;
    oldPassword: string | undefined;

}

export class JoinChannelDTO {
    @IsUUID()
    channelId: string;
  
    @IsUUID()
    userId: string;

    password: string;
}

export class LeaveChannelDTO {
    @IsUUID()
    channelId: string;
  
    @IsUUID()
    userId: string;
}

export class ChannelIdDTO {
    @IsUUID()
    channelId: string;
}

export class UserIdDTO {
    @IsUUID()
    userId: string;
}

export class CreateChannelDTO {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    owner: IChannelUser;

    @IsNotEmpty()
    visibility: string;

    password: string;
    users: string;
}

export class ChannelsWhereUserDTO {
    @IsUUID()
    userId: string;

    @IsNotEmpty()
    channelContain: string;
}

export class KickPlayerDTO {
    @IsUUID()
    channelId: string;
    
    @IsUUID()
    admin: string;
    
    @IsUUID()
    target: string;
}

export class BanPlayerDTO {
    @IsUUID()
    channelId: string;
    
    @IsUUID()
    admin: string;
    
    @IsUUID()
    target: string;

    @IsDateString()
    time: string;
}

export interface IbanPlayer {
    channelId: string,
    admin: string,
    target: string,
    time: undefined
}