export interface IChatReceive {
    id: number,
    userId: string,
    channelId: string
    message: string,
    createdAt: Date
}

export interface IChat {
    id: number,
    userId: string,
    message: string,
    createdAt: Date
}