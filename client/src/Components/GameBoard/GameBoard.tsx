import { Socket } from "socket.io-client";
import React from 'react';
import './GameBoard.scss';

interface props {
  socket : Socket | undefined;
  room : IRoom | undefined;
}

interface IPlayer {
  id: string;
  name: string; 
  score: number;
  status: string;
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
}

function GameBoard(props : props) {
  return (
    <div className="game-board">
      <div className="game-board__player">
        <div className="game-board__player__name">
          {props.room?.playerA.name}
        </div>
        <div className="game-board__player__score">
          {props.room?.playerA.score}
        </div>
      </div>
      <div className="game-board__player">
        <div className="game-board__player__name">
          {props.room?.playerB.name}
        </div>
        <div className="game-board__player__score">
          {props.room?.playerB.score}
        </div>
      </div>
    </div>
    
  );
}

export default GameBoard;
