import { IChannelUser } from "./User";

export interface IcreateChannel {
    name: string,
    owner: IChannelUser,
    visibility: string,
    password: string,
    users: IChannelUser[]
}