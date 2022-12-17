import React, { useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import GameBoard from "../GameBoard/GameBoard";
import "./GameSpectate.scss";
import { Stage, Layer, Rect, Circle, Text } from "react-konva";
import Konva from "konva";
import useEventListener from "@use-it/event-listener";
import NavBar from "../Nav/NavBar";
import useImage from "use-image";

interface props {
  socket: Socket | undefined;
  room: IRoom | undefined;
  setRoom: any;
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

interface ICanvasBoard {
  x: number;
  y: number;
  id: string;
  percentY: number;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  let maxWidth = 1000;
  let maxHeight = 600;

  const [image] = (props?.room?.settings?.background == "background1" ? useImage("") : useImage(""));
  const [windowsWidth, setWindowsWidth] = useState(window.innerWidth > maxWidth ?  maxWidth : window.innerWidth);
  const [windowsHeight, setWindowsHeight] = useState(window.innerHeight > maxHeight - 200 ? maxHeight : window.innerHeight - 200); // game board
  const [boardWidth, setBoardWidth] = useState<number>(
    props.room?.settings.boardWidth
      ? (props.room?.settings.boardWidth / 100) * windowsWidth
      : 100
  );
  const [boardHeight, setBoardHeight] = useState<number>(
    props.room?.settings.boardHeight
      ? (props.room?.settings.boardHeight / 100) * windowsHeight
      : 100
  );
  const [ball, setBall] = useState<ICanvasBall>({
    id: "ball",
    x: props.room?.ball.x
      ? (props.room?.ball.x / 100) * windowsWidth
      : windowsWidth / 2,
    y: props.room?.ball.y
      ? (props.room?.ball.y / 100) * windowsHeight
      : windowsHeight / 2,
    radius: props.room?.settings.ballRadius
      ? (props.room?.settings.ballRadius / 100) * windowsHeight
      : 100,
    percentX: 50,
    percentY: 50,
  });
  const [playerA, setPlayerA] = useState<ICanvasBoard>({
    id: "playerA",
    x: 0.01 * windowsWidth,
    y: props.room?.playerA.y
      ? (props.room?.playerA.y / 100) * windowsHeight
      : windowsHeight / 2 - boardHeight / 2,
    percentY: 50,
  });
  const [playerB, setPlayerB] = useState<ICanvasBoard>({
    id: "playerB",
    x: (windowsWidth - 0.015 * windowsWidth),
    y: props.room?.playerB.y
      ? (props.room?.playerB.y / 100) * windowsHeight
      : windowsHeight / 2 - boardHeight / 2,
    percentY: 50,
  });
  const [timeouts, setTimeouts] = useState<Number>(30);

  function updateDisplay() : void {
    // Clear context and reprint everything
    if (contextRef.current)
    {
      contextRef.current.clearRect(0, 0, windowsWidth, windowsHeight);
      contextRef.current.fillStyle = "black";
      contextRef.current.fillRect(0, 0, windowsWidth, windowsHeight);
      contextRef.current.fillStyle = "white";
      contextRef.current.fillRect(windowsWidth / 2 - 2, 0, 4, windowsHeight );
      contextRef.current.fillStyle = "gray";
      contextRef.current.font = "30px Arial";
      // print name of players and score
      //contextRef.current.fillText(props.room?.playerA.name + " : " + props.room?.scoreA, windowsWidth / 2 - 400, 50);
      //contextRef.current.fillText(props.room?.playerB.name + " : " + props.room?.scoreB, windowsWidth / 2 + 100, 50);
      contextRef.current.font = "30px Arial";
      if (props.room?.scoreA)
        contextRef.current.fillText(props.room?.scoreA.toString(), windowsWidth / 2 - 50, 50);
      else
        contextRef.current.fillText("0", windowsWidth / 2 - 50, 50);
      if (props.room?.scoreB)
        contextRef.current.fillText(props.room?.scoreB.toString(), windowsWidth / 2 + 30, 50);
      else
        contextRef.current.fillText("0", windowsWidth / 2 + 30, 50);
      // Player A
      contextRef.current.fillStyle = "white";
      contextRef.current.fillRect(playerA.x, playerA.y, boardWidth, boardHeight);
      // Player B
      contextRef.current.fillStyle = "white";
      contextRef.current.fillRect(playerB.x, playerB.y, boardWidth, boardHeight);
      // Ball
      contextRef.current.beginPath();
      contextRef.current.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
      contextRef.current.fillStyle = "white";
      contextRef.current.fill();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (context) {
      contextRef.current = context;
      updateDisplay();
    }
  }, []);
  function handleResize() {
    setWindowsWidth(window.innerWidth > maxWidth ?  maxWidth : window.innerWidth);
    setWindowsHeight(window.innerHeight > maxHeight + 200 ? maxHeight - 200 : window.innerHeight);
    //setWindowsHeight(t /*- 200*/);
    setBoardWidth(
      props.room?.settings.boardWidth
        ? (props.room?.settings.boardWidth / 100) * windowsWidth
        : 100
    );
    setBoardHeight(
      props.room?.settings.boardHeight
        ? (props.room?.settings.boardHeight / 100) * windowsHeight
        : 100
    );
    setBall({
      ...ball,
      id: "ball",
      radius: props.room?.settings.ballRadius
        ? (props.room?.settings.ballRadius / 100) * windowsHeight
        : 100,
      x: (ball.percentX / 100) * windowsWidth,
      y: (ball.percentY / 100) * windowsHeight,
      percentX: ball.percentX,
      percentY: ball.percentY,
    });
    console.log(
      "width:",
      windowsWidth,
      "height:",
      windowsHeight,
      "ballRadius:",
      ball?.radius
    );
    setPlayerA({
      ...playerA,
      id: "playerA",
      x: (0.01 * windowsWidth),
      y: (playerA.percentY / 100) * windowsHeight,
      percentY: playerA.percentY,
    });
    setPlayerB({
      ...playerB,
      id: "playerB",
      x: (windowsWidth - 0.015 * windowsWidth),
      y: (playerB.percentY / 100) * windowsHeight,
      percentY: playerB.percentY,
    });
    updateDisplay();
  }
  useEventListener("resize", handleResize);
  // Check car le resize ne met pas a jour les var du useEffect
    
  
  props.socket?.removeListener("playerMovement");
  props.socket?.on("playerMovement", (data: any) => {
    if (data.player && data.x != undefined && data.y != undefined) {
      if (data.player === "playerA") {
        setPlayerA({
          ...playerA,
          id: "playerA",
          x: 0.01 * windowsWidth,
          y: (data.y / 100) * windowsHeight,
          percentY: data.y,
        });
      } else if ((data.player === "playerB")) {
        setPlayerB({
          ...playerB,
          id: "playerB",
          x: windowsWidth - 0.015 * windowsWidth,
          y: (data.y / 100) * windowsHeight,
          percentY: data.y,
        });
      }
    }
  });
  props.socket?.removeListener("ballMovement");
  props.socket?.on("ballMovement", (room: IRoom) => {
    setBall({
      ...ball,
      id: "ball",
      x: (room.ball.x / 100) * windowsWidth,
      y: (room.ball.y / 100) * windowsHeight,
      percentX: room.ball.x,
      percentY: room.ball.y,
    });
    updateDisplay();
  });
  props.socket?.removeListener("roomUpdated");
  props.socket?.on("roomUpdated", (data: IRoom) => {
    if (props.room) // update scoreA and scoreB only
      props.setRoom({...props.room, scoreA: data.scoreA, scoreB: data.scoreB});
  });
  return (
    <div id="gameMain" className="cursor">
      <canvas ref={canvasRef} width={windowsWidth} height={windowsHeight} />
    </div>
  );
}

export default GameSpectate;
