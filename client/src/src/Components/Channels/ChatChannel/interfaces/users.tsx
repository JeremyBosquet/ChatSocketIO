export interface Iuser {
    uuid: string;
    userId: string;
    username: string;
    trueUsername: string;
    channelId: string;
    role: string | undefined;
}

export interface IuserDb {
    uuid: string;
    username: string;
    trueUsername: string;
    image: string;
    role: string;
}