export interface Iuser {
    uuid: string;
    userId: string;
    username: string;
    channelId: string;
    role: string | undefined;
}

export interface IuserDb {
    uuid: string;
    username: string;
    image: string;
    role: string;
}