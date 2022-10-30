import React, { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import GameBoard from "../GameBoard/GameBoard";
import './GameSpectate.scss';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import Konva from "konva";
import useEventListener from "@use-it/event-listener";

interface props {
  socket: Socket | undefined;
  room: IRoom | undefined;
  /* playerId: string;
   playerName: string;*/
}

interface IPlayer {
  id: string;
  name: string;
  score: number;
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

interface ICanvasBoard {
  x: number;
  y: number;
  id: string;
  percentY: number;
  ref: React.RefObject<Konva.Rect>;
}

interface IBall {
  x: number;
  y: number;
  speed: number;
  direction: number;
}

interface ICanvasBall {
  x: number;
  y: number;
  id: string;
  radius: number;
  percentX: number;
  percentY: number;
  ref: React.RefObject<Konva.Circle>;
}

/*

  Todo :
  - Add a timer to the game
  - Add a score to the game
  - Add a winner to the game
  - Add a loser to the game
  - Add a column for the last movement of the player and the ball for the connection
  - On resize reset the position of each items

*/

function GameSpectate(props: props) {
  const [windowsWidth, setWindowsWidth] = useState(window.innerWidth / 1.2);
  const [windowsHeight, setWindowsHeight] = useState(window.innerHeight / 1.4);
  const [boardWidth, setBoardWidth] = useState<number>(props.room?.settings.boardWidth ? (props.room?.settings.boardWidth / 100) * windowsWidth : 100);
  const [boardHeight, setBoardHeight] = useState<number>(props.room?.settings.boardHeight ? (props.room?.settings.boardHeight / 100) * windowsHeight : 100);
  const [ball, setBall] = useState<ICanvasBall>({ id: "ball", x: (props.room?.ball.x ? (props.room?.ball.x / 100) * windowsWidth : windowsWidth / 2), y: (props.room?.ball.y ? (props.room?.ball.y / 100) * windowsHeight : windowsHeight / 2), radius: props.room?.settings.ballRadius ? (props.room?.settings.ballRadius / 100) * windowsHeight : 100, percentX: 50, percentY: 50, ref: React.createRef<Konva.Circle>() });
  const [playerA, setPlayerA] = useState<ICanvasBoard>({ id: "playerA", x: 0.15 * windowsWidth, y: (props.room?.playerA.y ? (props.room?.playerA.y / 100) * windowsHeight : (windowsHeight / 2) - (boardHeight / 2)), percentY: 50, ref: React.createRef<Konva.Rect>() });
  const [playerB, setPlayerB] = useState<ICanvasBoard>({ id: "playerB", x: windowsWidth - (0.15 * windowsWidth), y: (props.room?.playerB.y ? (props.room?.playerB.y / 100) * windowsHeight : (windowsHeight / 2) - (boardHeight / 2)), percentY: 50, ref: React.createRef<Konva.Rect>() });
  //const [notification, setNotificaton] = useState<Boolean>(false); 

  function handleResize() {
    setWindowsWidth(window.innerWidth / 1.2);
    setWindowsHeight(window.innerHeight / 1.4);
    setBoardWidth(props.room?.settings.boardWidth ? (props.room?.settings.boardWidth / 100) * windowsWidth : 100);
    setBoardHeight(props.room?.settings.boardHeight ? (props.room?.settings.boardHeight / 100) * windowsHeight : 100);
    setBall({ ...ball, id: "ball", radius: props.room?.settings.ballRadius ? (props.room?.settings.ballRadius / 100) * windowsHeight : 100, x: (ball.percentX / 100) * windowsWidth, y: (ball.percentY / 100) * windowsHeight, percentX: ball.percentX, percentY: ball.percentY });
    console.log("width:", windowsWidth, "height:", windowsHeight, "ballRadius:", ball?.radius);
    setPlayerA({ ...playerA, id: "playerA", x: (0.15 * windowsWidth) - boardWidth, y: (playerA.percentY / 100) * windowsHeight, percentY: playerA.percentY });
    setPlayerB({ ...playerB, id: "playerB", x: windowsWidth - boardWidth - (0.15 * windowsWidth), y: (playerB.percentY / 100) * windowsHeight, percentY: playerB.percentY });
  }

  useEventListener('resize', handleResize);

  useEffect(() => { // Check car le resize ne met pas a jour les var du useEffect
    props.socket?.removeListener('playerMovement');
    props.socket?.on("playerMovement", (room: IRoom) => {
      setPlayerA({ ...playerA, id: "playerA", x: 0.15 * windowsWidth, y: (room.playerA.y / 100) * windowsHeight, percentY: room.playerA.y });
      setPlayerB({ ...playerB, id: "playerB", x: windowsWidth - boardWidth - (0.15 * windowsWidth), y: (room.playerB.y / 100) * windowsHeight, percentY: room.playerB.y });
    });
    props.socket?.removeListener('ballMovement');
    props.socket?.on("ballMovement", (room: IRoom) => {
      ball.ref.current?.to({
        x: (room.ball.x / 100) * windowsWidth,
        y: (room.ball.y / 100) * windowsHeight,
        duration: 0.248,
        onFinish: () => {
          setBall({ ...ball, id: "ball", x: (room.ball.x / 100) * windowsWidth, y: (room.ball.y / 100) * windowsHeight, percentX: room.ball.x, percentY: room.ball.y });

        }
      });
    });
  }, [props.socket, playerA, playerB, ball, windowsHeight, windowsWidth, boardWidth]);
  return (
    <div>
      <p>Game (t'es une merde) :</p>
      <GameBoard socket={props.socket} room={props.room} />
      <div id="gameMainCanvas">
        <Stage width={windowsWidth} height={windowsHeight} className="gameMainCanvas">
          <Layer >
            <Text text="Game : ?" />
            <Rect width={9000} height={8000} x={0} y={0} fill="gray" />
            {<Rect ref={playerA.ref} x={playerA.x} y={playerA.y} width={boardWidth} height={boardHeight} fill="blue" />}
            {<Rect ref={playerB.ref} x={playerB.x} y={playerB.y} width={boardWidth} height={boardHeight} fill="green" />}
            {<Circle ref={ball.ref} x={ball.x} y={ball.y} radius={ball.radius} fill="red" />}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default GameSpectate;