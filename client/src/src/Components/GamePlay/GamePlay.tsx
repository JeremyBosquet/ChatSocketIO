import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import GameBoard from "../GameBoard/GameBoard";
import "./GamePlay.scss";
import useImage from 'use-image';
import useEventListener from "@use-it/event-listener";
import {Helmet} from "react-helmet";

interface props {
  socket: Socket | undefined;
  room: IRoom | undefined;
  playerId: string;
  playerName: string;
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
 
function GamePlay(props: props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  let maxWidth = 1000;
  let maxHeight = 600;

  let boardAX = 0.025;
  let boardBX = 0.025;

  const [image] = (props?.room?.settings?.background == "background1" ? useImage("https://cdn.discordapp.com/attachments/768496887720181770/1047556063500709908/image.png") : useImage("https://cdn.discordapp.com/attachments/768496887720181770/1047556063500709908/image.png"));
  const [imageA] = (props.room?.playerA.name === props.playerName ? useImage(import.meta.env.VITE_URL_API + ":7000/api/user/getProfilePicture/" + props.room?.playerA.id) : useImage(import.meta.env.VITE_URL_API + ":7000/api/user/getProfilePicture/" + props.room?.playerA.id));
  const [imageB] = (props.room?.playerB.name === props.playerName ? useImage(import.meta.env.VITE_URL_API + ":7000/api/user/getProfilePicture/" + props.room?.playerB.id) : useImage(import.meta.env.VITE_URL_API + ":7000/api/user/getProfilePicture/" + props.room?.playerB.id));
  
  let mult = 0.5;
  if (window.innerWidth < 500)
    mult = 0.9;
  let _t = window.innerHeight *mult ;
  let _r = (window.innerWidth*mult) / (window.innerHeight * mult);
  if (_r < 16 / 9) {
    _t = (window.innerWidth * mult) * (9 / 16);
  }
  const [windowsWidth, setWindowsWidth] = useState((16 * _t) / 9);
  const [windowsHeight, setWindowsHeight] = useState(_t); // game board
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
    x: boardAX * windowsWidth,
    y: props.room?.playerA.y
      ? (props.room?.playerA.y / 100) * windowsHeight
      : windowsHeight / 2 - boardHeight / 2,
    percentY: 50,
  });
  const [playerB, setPlayerB] = useState<ICanvasBoard>({
    id: "playerB",
    x: (windowsWidth - boardBX * windowsWidth),
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
      // Create background image and print it
      contextRef.current.clearRect(0, 0, windowsWidth, windowsHeight);
      contextRef.current.fillStyle = "black";
      contextRef.current.fillRect(0, 0, windowsWidth, windowsHeight);
      if (image)
       contextRef.current.drawImage(image, 0, 0, windowsWidth, windowsHeight);
      contextRef.current.fillStyle = "white";
      contextRef.current.fillRect(windowsWidth / 2 - 2, 0, 4, windowsHeight );
      contextRef.current.fillStyle = "white";
      // print name of players and score
      //contextRef.current.fillText(props.room?.playerA.name + " : " + props.room?.scoreA, windowsWidth / 2 - 400, 50);
      //contextRef.current.fillText(props.room?.playerB.name + " : " + props.room?.scoreB, windowsWidth / 2 + 100, 50);
      //contextRef.current.font = "30px Arial";
      // On top left corner put the imageA (of player A) 
      let display = 50;
      if (window.innerWidth < 500)
      {  display = 30;
        mult = 0.9;
        contextRef.current.font = "20px Arial";
        if (props.room?.scoreA)
          contextRef.current.fillText(props.room?.scoreA.toString(), windowsWidth / 2 - 35, 35);
        else
          contextRef.current.fillText("0", windowsWidth / 2 - 20, 25);
        if (props.room?.scoreB)
          contextRef.current.fillText(props.room?.scoreB.toString(), windowsWidth / 2 + 20, 35);
        else
          contextRef.current.fillText("0", windowsWidth / 2 + 10, 25);
        
      }
      else
      {
        mult = 0.5;
        contextRef.current.font = "30px Arial";
        if (imageA)
         contextRef.current.drawImage(imageA, windowsWidth / 2 - 100, 0, display, display);
        /// On top right corner put the imageB (of player B)
        if (imageB)
        contextRef.current.drawImage(imageB, windowsWidth / 2 + 50, 0, display, display);
        if (props.room?.scoreA)
          contextRef.current.fillText(props.room?.scoreA.toString(), windowsWidth / 2 - 35, 35);
        else
          contextRef.current.fillText("0", windowsWidth / 2 - 35, 35);
        if (props.room?.scoreB)
          contextRef.current.fillText(props.room?.scoreB.toString(), windowsWidth / 2 + 20, 35);
        else
          contextRef.current.fillText("0", windowsWidth / 2 + 20, 35);
      }
      // Create a border around the score
      contextRef.current.fillStyle = "red";
      // Size of the border
      contextRef.current.lineWidth = 1;
      // color of the border
      contextRef.current.strokeStyle = "white";
      //contextRef.current.strokeRect(windowsWidth / 2 - 50, 0, 100, 50);
      
      //  contextRef.current.fillText("10", windowsWidth / 2 + 11, 35);
      //  contextRef.current.fillText("10", windowsWidth / 2 - 45, 35);
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

  const mousemove = 
    (e: any) => {
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
        const _player = { id: "", x: 0, y: 0 };
        if (props.room?.playerA.name === props.playerName) {
          _player.id = playerA.id;
          _player.x = playerA.x;
          _player.y = playerA.y;
        } else {
          _player.id = playerB.id;
          _player.x = playerB.x;
          _player.y = playerB.y;
        }
        if (!e?.clientY) return;
        const _height = e?.clientY;
        _player.y =
          (((_height - boardHeight / 2) * 100) / window.innerHeight) *
          (windowsHeight / 100);
        if (_player.y < 0) _player.y = 0;
        if (_player.y + boardHeight > windowsHeight)
          _player.y = windowsHeight - boardHeight;

        props.socket?.emit("playerMove", {
          id: _player.id,
          x: (100 * _player.x) / windowsWidth,
          y: (100 * _player.y) / windowsHeight,
          timestamp: Date.now(),
        });
        if (props.room?.playerA.name === props.playerName) {
          setPlayerA({ ...playerA, y: _player.y, percentY: ((100 * _player.y) / windowsHeight), x: boardAX * windowsWidth});
          setPlayerB({ ...playerB, x: (windowsWidth - boardBX * windowsWidth) });
        }
        else {
          setPlayerA({ ...playerA, x: boardAX * windowsWidth });
          setPlayerB({ ...playerB, y: _player.y, percentY: ((100 * _player.y) / windowsHeight), x: (windowsWidth - boardBX * windowsWidth) });
        }
        updateDisplay();
    }

  useEventListener("mousemove", mousemove);
  function handleResize() {
    // Make a ratio of 16:9 on the window

    let t = window.innerHeight *mult ;
    let r = (window.innerWidth*mult) / (window.innerHeight * mult);
    if (r < 16 / 9) {
      t = (window.innerWidth * mult) * (9 / 16);
    }
    setWindowsHeight(t /*- 200*/);
    setWindowsWidth((16 * t) / 9);
    
    //if (window.innerHeight < window.innerWidth)
    //{
    //setWindowsHeight(9 * (window.innerWidth /2) / 16);
    //setWindowsWidth(  (window.innerWidth / 2));
    //}
    //else
    //{
    //  setWindowsHeight((window.innerHeight /2));
    //  setWindowsWidth(9 * (window.innerHeight /2) / 16);
//
    //}
    console.log(window.innerHeight, window.innerWidth, windowsHeight, windowsWidth, window.innerWidth / window.innerHeight, windowsWidth / windowsHeight)
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
      x: (boardAX * windowsWidth),
      y: (playerA.percentY / 100) * windowsHeight,
      percentY: playerA.percentY,
    });
    setPlayerB({
      ...playerB,
      id: "playerB",
      x: (windowsWidth - boardBX * windowsWidth),
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
          x: boardAX * windowsWidth,
          y: (data.y / 100) * windowsHeight,
          percentY: data.y,
        });
      } else if ((data.player === "playerB")) {
        setPlayerB({
          ...playerB,
          id: "playerB",
          x: windowsWidth - boardBX * windowsWidth,
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
  return (
    <div id="gameMain" className="cursor">
		<Helmet>
			<meta charSet="utf-8" />
			<title>Game - transcendence </title>
		</Helmet>
    <GameBoard socket={props.socket} room={props.room}/>
      <canvas ref={canvasRef} width={windowsWidth} height={windowsHeight} />
    </div>
  );
}

export default GamePlay;