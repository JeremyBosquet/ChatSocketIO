import { Socket } from "socket.io-client";
import React from "react";
import "./GameBoard.scss";

interface props {
	socket: Socket | undefined;
	room: IRoom | undefined;
}


interface IPlayer {
	id: string;
	name: string;
	status: string;
	x: number;
	y: number;
}

interface IRoom {
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
}

interface IConfiguration {
	difficulty: string;
	background: string;
}

interface ISettings {
	defaultSpeed: number;
	defaultDirection: number;
	boardWidth: number;
	boardHeight: number;
	ballRadius: number;
	background: string;
}

interface IBall {
	x: number;
	y: number;
	speed: number;
	direction: number;
}

function GameBoard(props: props) {
	return (
		<div className="game-board">
			<div className="game-board__player">
				<div className="game-board__player__name">
					{props.room?.playerA.name}
				</div>
			</div>
			<div className="game-board__player">
				<div className="game-board__player__name">
					{props.room?.playerB.name}
				</div>
			</div>
		</div>
	);
}

export default GameBoard;
