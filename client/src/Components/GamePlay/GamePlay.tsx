import React, { Component, Key, useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import GameBoard from "../GameBoard/GameBoard";
import './GamePlay.scss';
import { createRoot } from 'react-dom/client';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import Konva from "konva";
import { getFCP } from "web-vitals";
import useEventListener from "@use-it/event-listener";

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
}

interface ISettings{
  defaultSpeed: number;
  defaultDirection: number;
  boardWidth: number;
  boardHeight: number;
  ballRadius: number;
}

interface ICanvasBoard {
  x: number;
  y: number;
  id: string;
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
  const [width, setWidth] = useState<number>(window.innerWidth / 1.2);
  const [height, setHeight] = useState<number>(window.innerHeight / 1.4);
  const [boardWidth, setBoardWidth] = useState<number>(width * (props.room?.settings.boardWidth ? props.room?.settings.boardWidth : 0.025));
  const [boardHeight, setBoardHeight] = useState<number>(height * (props.room?.settings.boardHeight ? props.room?.settings.boardHeight : 0.20));
  const [ballRadius, setBallRadius] = useState<number>(height * (props.room?.settings.ballRadius ? props.room?.settings.ballRadius : 0.015));
  const [playerA, setPlayerA] = useState<ICanvasBoard>({ id: "playerA", x: width * 0.02, y: height * 0.5 - boardHeight * 0.5 });
  const [playerB, setPlayerB] = useState<ICanvasBoard>({ id: "playerB", x: width - (width * 0.02), y: height * 0.5 - boardHeight * 0.5 });
  const [ball, setBall] = useState<ICanvasBall>({ id: "ball", x: width * 0.5, y: height * 0.5});
  const playerARef = useRef<Konva.Rect>(null);
  const playerBRef = useRef<Konva.Rect>(null);
  const ballRef = useRef<Konva.Circle>(null);

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
    _player.y = (((_height - (boardHeight / 2)) * 100) / window.innerHeight) * (height / 100);
    if (_player.y < 0)
      _player.y = 0;
    if (_player.y + boardHeight > height)
      _player.y = height - boardHeight;
    if (tmpPlayerY === _player.y)
      return;
    const shape = playerARef.current;
    props.socket?.emit("playerMove", { id: _player.id, x: ((100 * _player.x) / width), y: ((100 * _player.y) / height) });
    if (props.room?.playerA.name === props.playerName)
      setPlayerA(_player);
    else
      setPlayerB(_player);
  }, [playerA, playerB, height, boardHeight, window]);

  useEventListener('mousemove', mousemove);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth / 1.2);
      setHeight(window.innerHeight / 1.4);
      setBallRadius(height * (props.room?.settings.ballRadius ? props.room?.settings.ballRadius : 0.025));
      setBoardHeight(height * (props.room?.settings.boardHeight ? props.room?.settings.boardHeight : 0.20));
      setBoardWidth(width * (props.room?.settings.boardWidth ? props.room?.settings.boardWidth : 0.015));
      console.log(width, height, ballRadius, boardWidth, boardHeight);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [width, height, ballRadius, boardWidth, boardHeight]);

  useEffect(() => {
    props.socket?.on("playerReady", (data: IRoom) => {
      setPlayerA({ id: "playerA", x: (data.playerA.x / 100) * width, y: height * (data.playerA.y / 100) });
      setPlayerB({ id: "playerB", x: (data.playerB.x / 100) * width, y: height * (data.playerB.y / 100) });
      setBall({ id: "ball", x: ((data.ball.x / 100) * width), y: ((data.ball.y / 100) * height)});
    });
    props.socket?.on("playerMovement", (player: ICanvasBoard) => {
      if (player.id === "playerA" && props.room?.playerA.name !== props.playerName) {
        setPlayerA({ id: "playerA", x: playerA.x, y: height * (player.y / 100) });
      }
      else if (player.id === "playerB" && props.room?.playerB.name !== props.playerName) {
        setPlayerB({ id: "playerB", x: playerB.x, y: height * (player.y / 100) });
      }
    });
  }, [playerA, playerB, width, height, boardWidth, boardHeight, props.room, props.playerName]);
  useEffect(() => {
    props.socket?.on("ballMovement", (_ball: any) => {
      //setBall({ id: "ball", x: ((_ball.x / 100) * width), y: ((_ball.y / 100) * height)});
      /*ballRef.current?.to({
        x: ((_ball.x / 100) * width),
        y: ((_ball.y / 100) * height),
      });*/
    });
  }, [ball, height, width]);

  return (
    <div>
      <p>Game :</p>
      <GameBoard socket={props.socket} room={props.room} />
            <button onClick={() => {
              console.log("Hey");
              ballRef.current?.to({
                vx: 10,
                vy: Math.random() - 2,
              });
            }}>Velocity</button>
      <div id="gameMainCanvas">
        <Stage width={width} height={height} className="gameMainCanvas">
          <Layer >
            <Text text="Game : ?" />
            <Rect width={9000} height={8000} x={0} y={0} fill="gray" />
            {<Rect ref={playerARef} x={playerA.x} y={playerA.y} width={boardWidth} height={boardHeight} fill="blue" />}
            {<Rect ref={playerBRef} x={playerB.x} y={playerB.y} width={boardWidth} height={boardHeight} fill="green" />}
            {<Circle ref={ballRef} draggable x={ball.x} y={ball.y} radius={ballRadius} fill="red" />}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default GamePlay;
