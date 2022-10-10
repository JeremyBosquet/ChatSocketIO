import React, { Component, Key, useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import GameBoard from "../GameBoard/GameBoard";
import './GamePlay.scss';
import { createRoot } from 'react-dom/client';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import Konva from "konva";
import { getFCP } from "web-vitals";
import useEventListener from "@use-it/event-listener";
import { json } from "stream/consumers";

interface props {
  socket: Socket | undefined;
  room: IRoom | undefined;
  playerId: string;
  playerName: string;
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
  configurationA : IConfiguration;
  configurationB: IConfiguration;
}

interface IConfiguration{
  difficulty: string;
  background: string;
}

interface ISettings{
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

function GamePlay(props: props) {
  const [windowsWidth, setWindowsWidth] = useState(window.innerWidth / 1.2);
  const [windowsHeight, setWindowsHeight] = useState(window.innerHeight / 1.4);
  const [ball, setBall] = useState<ICanvasBall>({id: "ball", x: windowsWidth / 2, y: windowsHeight / 2, radius: (windowsHeight / 50), percentX: 50, percentY: 50, ref: React.createRef<Konva.Circle>()});
  const [playerA, setPlayerA] = useState<ICanvasBoard>({id: "playerA", x: 0, y: windowsHeight / 2, percentY: 50, ref: React.createRef<Konva.Rect>()});
  const [playerB, setPlayerB] = useState<ICanvasBoard>({id: "playerB", x: windowsWidth - 100, y: windowsHeight / 2, percentY: 50, ref: React.createRef<Konva.Rect>()});
  const [boardWidth, setBoardWidth] = useState<number>(windowsWidth / 10);
  const [boardHeight, setBoardHeight] = useState<number>(windowsHeight / 4);

  const mousemove = useCallback((e: any) => {
    const _player = { id: "", x: 0, y: 0 };
    if (props.room?.playerA.name === props.playerName) {
      _player.id = playerA.id;
      _player.x = playerA.x;
      _player.y = playerA.y;
    }
    else {
      _player.id = playerB.id;
      _player.x = playerB.x;
      _player.y = playerB.y;
    }
    if (!e?.clientY)
      return;
    const _height = e?.clientY;
    const tmpPlayerY = _player.y;
    _player.y = (((_height - (boardHeight / 2)) * 100) / window.innerHeight) * (windowsHeight / 100);
    if (_player.y < 0)
      _player.y = 0;
    if (_player.y + boardHeight > windowsHeight)
      _player.y = windowsHeight - boardHeight;
    if (tmpPlayerY === _player.y)
      return;
    const shape = playerA.ref.current;
    props.socket?.emit("playerMove", { id: _player.id, x: ((100 * _player.x) / windowsWidth), y: ((100 * _player.y) / windowsHeight) });
    if (props.room?.playerA.name === props.playerName)
      setPlayerA({ ...playerA, y: _player.y, percentY: ((100 * _player.y) / windowsHeight) });
    else
      setPlayerB({ ...playerB, y: _player.y, percentY: ((100 * _player.y) / windowsHeight) });
  }, [playerA, playerB, windowsHeight, windowsWidth, boardHeight, window]);

  useEventListener('mousemove', mousemove);
  function handleResize() {
    setWindowsWidth(window.innerWidth / 1.2);
    setWindowsHeight(window.innerHeight / 1.4);
    setBoardWidth(windowsWidth / 10);
    setBoardHeight(windowsHeight / 4);
    setBall({...ball,id: "ball", radius: windowsHeight / 50, x: (ball.percentX / 100) * windowsWidth, y: (ball.percentY / 100) * windowsHeight, percentX: ball.percentX, percentY: ball.percentY});
     console.log("width:", windowsWidth,"height:",  windowsHeight,"ballRadius:",  ball?.radius);
    setPlayerA({...playerA, id: "playerA", x: 0, y: (playerA.percentY / 100) * windowsHeight, percentY: playerA.percentY});
    setPlayerB({...playerB, id: "playerB", x: windowsWidth - boardWidth, y: (playerB.percentY / 100) * windowsHeight, percentY: playerB.percentY});
  }
  useEventListener('resize', handleResize);
  
  useEffect(() => {
    props.socket?.on("playerMovement", (room: IRoom) => {
      console.log("playerMovement", props.playerId);
      if (room.playerB.id === props.playerId) {
        setPlayerA({...playerA, id: "playerA", x: 0, y: (room.playerA.y / 100) * windowsHeight, percentY: room.playerA.y});
      } else {
        setPlayerB({...playerB, id: "playerB", x: windowsWidth - boardWidth, y: (room.playerB.y / 100) * windowsHeight, percentY: room.playerB.y});
      }
    });
    props.socket?.on("ballMovement", (room: IRoom) => {
      setBall({...ball, id: "ball", x: (room.ball.x / 100) * windowsWidth, y: (room.ball.y / 100) * windowsHeight, percentX: room.ball.x, percentY: room.ball.y});
    });
  }, [props.socket, props.playerId, playerA, playerB, ball, windowsHeight, windowsWidth, boardWidth]);
  /*useEffect(() => {
    console.log("uwu");
    if (props.socket) {
    }
  }, [playerA, playerB, windowsWidth, windowsHeight, boardWidth, boardHeight, props.room, props.playerName]);*/


  return (
    <div>
      <p>Game :</p>
      <GameBoard socket={props.socket} room={props.room} />
      <div id="gameMainCanvas">
      <Stage width={windowsWidth} height={windowsHeight} className="gameMainCanvas">
          <Layer >
            <Text text="Game : ?" />
            <Rect width={9000} height={8000} x={0} y={0} fill="gray" />
            {<Rect ref={playerA.ref} x={playerA.x} y={playerA.y} width={boardWidth} height={boardHeight} fill="blue" />}
            {<Rect ref={playerB.ref} x={playerB.x} y={playerB.y} width={boardWidth} height={boardHeight} fill="green" />}
            {<Circle ref={ball.ref} draggable x={ball.x} y={ball.y} radius={ball.radius} fill="red" />}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default GamePlay;
/*<Stage width={width} height={height} className="gameMainCanvas">
          <Layer >
            <Text text="Game : ?" />
            <Rect width={9000} height={8000} x={0} y={0} fill="gray" />
            {<Rect ref={playerARef} x={playerA.x} y={playerA.y} width={boardWidth} height={boardHeight} fill="blue" />}
            {<Rect ref={playerBRef} x={playerB.x} y={playerB.y} width={boardWidth} height={boardHeight} fill="green" />}
            {<Circle ref={ballRef} draggable x={ball.x} y={ball.y} radius={ballRadius} fill="red" />}
          </Layer>
        </Stage>*/