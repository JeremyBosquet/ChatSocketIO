export interface IPlayer {
	id: string;
	name: string;
	status: string;
	x: number;
	y: number;
}

export interface IRoom {
	id: string;
	name: string;
	nbPlayers: number;
	owner: string;
	status: string;
	createdAt: string;
	playerA: IPlayer;
	playerB: IPlayer;
	scoreA: number;
	scoreB: number;
	ball: IBall;
	settings: ISettings;
	configurationA: IConfiguration;
	configurationB: IConfiguration;
    lastActivity: number;
}

export interface IConfiguration {
	difficulty: string;
	background: string;
    confirmed: boolean;
}

export interface ISettings {
	defaultSpeed: number;
	defaultDirection: number;
	boardWidth: number;
	boardHeight: number;
	ballRadius: number;
	background: string;
}

export interface ICanvasBoard {
	x: number;
	y: number;
	id: string;
	percentY: number;
}

export interface IBall {
	x: number;
	y: number;
	speed: number;
	direction: number;
}

export interface ICanvasBall {
	x: number;
	y: number;
	id: string;
	radius: number;
	percentX: number;
	percentY: number;
}

export interface IInvites {
	requestFrom: string;
	roomId: string;
}