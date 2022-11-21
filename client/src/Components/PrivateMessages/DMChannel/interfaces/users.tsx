export interface Iuser {
    id: string;
    userId: string;
    username: string;
    channelId: string;
}

export interface IuserDb {
    uuid: string;
    username: string;
    image: string;
    role: string;
}