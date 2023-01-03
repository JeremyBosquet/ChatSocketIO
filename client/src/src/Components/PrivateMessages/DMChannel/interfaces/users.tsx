export interface Iuser {
	uuid: string;
	userId: string;
	username: string;
	channelId: string;
	trueUsername: string;
}

export interface IuserDb {
	uuid: string;
	username: string;
	image: string;
	role: string;
	trueUsername: string;
}