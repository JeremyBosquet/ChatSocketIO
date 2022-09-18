import { IChannelUser } from "./User";

export interface IcreateChannel {
    name: string,
    owner: IChannelUser,
    visibility: string,
    password: string,
    users: string
}

export interface IeditChannelPassword {
    channelId: string,
    password: string,
    oldPassword: string | undefined,
}

export interface IkickPlayer {
    channelId: string,
    admin: string,
    target: string
}

export interface IbanPlayer {
    channelId: string,
    admin: string,
    target: string,
    time: undefined
}