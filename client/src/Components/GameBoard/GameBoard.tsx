import { Socket } from "socket.io-client";
import React from 'react';

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
      <div>
        PlayerA : {props.room?.playerA.name} - {props.room?.playerA.score} <br/>
        PlayerB : {props.room?.playerB.name} - {props.room?.playerB.score} <br/>
      </div>
  );
}

export default GameBoard;
