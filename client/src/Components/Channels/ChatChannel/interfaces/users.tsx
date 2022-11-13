export interface Iuser {
    id: string;
    userId: string;
    name: string;
    channelId: string;
    role: string | undefined;
}

export interface IuserDb {
    id: string;
    name: string;
    image: string;
    role: string;
}