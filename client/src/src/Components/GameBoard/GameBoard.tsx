import { Socket } from "socket.io-client";
import React from "react";
import "./GameBoard.scss";
import { IRoom } from "../GamePlay/Interfarces/GameInterace";

interface props {
	socket: Socket | undefined;
	room: IRoom | undefined;
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
