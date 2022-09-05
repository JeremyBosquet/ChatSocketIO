import React, { Key, useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import GameBoard from "../GameBoard/GameBoard";
import './GamePlay.scss';
import { createRoot } from 'react-dom/client';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import Konva from "konva";

interface props {
  socket : Socket | undefined;
  room : IRoom | undefined;
  playerId : string;
  playerName : string;
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

interface ICanvasBoard {
  x: number;
  y: number;
  id: string;
}

interface ICanvasBall {
  x: number;
  y: number;
  id: string;
  direction: number;
  speed: number;
}

/*

  Todo :
  - Add a timer to the game
  - Add a score to the game
  - Add a winner to the game
  - Add a loser to the game
  - Add a column for the last movement of the player and the ball for the connection

*/

function GamePlay(props : props) {
  const [width, setWidth] = useState<number>(window.innerWidth/  1.2);
  const [height, setHeight] = useState<number>(window.innerHeight / 1.4);
  const [boardWidth, setBoardWidth] = useState<number>(width * 0.025);
  const [boardHeight, setBoardHeight] = useState<number>(height * 0.20);
  const [ballRadius, setBallRadius] = useState<number>(height * 0.015);
  const [playerA, setPlayerA] = useState<ICanvasBoard>({id: "playerA", x: width * 0.02, y: height * 0.5 - boardHeight * 0.5});
  const [playerB, setPlayerB] = useState<ICanvasBoard>({id: "playerB", x: width - (width * 0.02), y: height * 0.5 - boardHeight * 0.5});
  const [ball, setBall] = useState<ICanvasBall>({id: "ball", x: width * 0.5, y: height * 0.5, direction: 90, speed: height * 0.03});
  const [ballActive, setBallActive] = useState<boolean>(false);

  const handleUserKeyPress = useCallback((e : any) => {
    const _player = {id: "", x: 0, y: 0};
    if (props.room?.playerA.name === props.playerName)
    {
      _player.id = playerA.id;
      _player.x = playerA.x;
      _player.y = playerA.y;
    }
    else
    {
      _player.id = playerB.id;
      _player.x = playerB.x;
      _player.y = playerB.y;
    }
    if (e?.key === "ArrowUp") {
       if (_player.y > 0) {
         _player.y -= height * 0.03;
          if (_player.y < 0)
          _player.y = 0;
        }
      }
      else if (e?.key === "ArrowDown") {
        if (_player.y + boardHeight < height) {
          _player.y += height * 0.03;
          if (_player.y + boardHeight > height)
          _player.y = height - boardHeight;
        }
      }
      else
        return ;
      props.socket?.emit("playerMove", {id: _player.id, x: ((100 * _player.x) / width), y: ((100 * _player.y) / height)});
      if (props.room?.playerA.name === props.playerName)
        setPlayerA(_player);
      else
        setPlayerB(_player);
  }, [playerA, playerB, height, boardHeight]);
  useEffect(() => {
    window.addEventListener("keydown", handleUserKeyPress);
    return () => {
        window.removeEventListener("keydown", handleUserKeyPress);
    };
}, [handleUserKeyPress]);
  
  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth/  1.2);
      setHeight(window.innerHeight / 1.4);
      setBallRadius(height * 0.025);
      setBoardHeight(height * 0.20);
      setBoardWidth(width * 0.015);
      console.log(width, height, ballRadius, boardWidth, boardHeight);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [width, height, ballRadius, boardWidth, boardHeight]);
  function resetBall() {
    setBall({id: "ball", x: width * 0.5, y: height * 0.5, direction: Math.random() * (2 * Math.PI), speed: height * 0.03});
  }
  function ballMovement() {
    if (!ballActive)
      return ;
    if (ball.x + ball.speed * Math.cos(ball.direction) > width || ball.x + ball.speed * Math.cos(ball.direction) < 0)
      console.log("T'es pas un gros con");
    props.socket?.emit("ballMove", {x: ((100 * (ball.x + (ball.speed * Math.cos(ball.direction)))) / width), y: ((100 * (ball.y+ (ball.speed * Math.sin(ball.direction)))) / height), direction: ball.direction, speed: ball.speed});
    
  }
  useEffect(() => {
    const interval = setInterval(() => {
      ballMovement();
    }, 250);
    return () => clearInterval(interval);
  }, [ballMovement, ball, ballActive]);
  useEffect(() => {
    props.socket?.on("playerMovement", (player : ICanvasBoard) => {
      if (player.id === "playerA" && props.room?.playerA.name !== props.playerName) {
        setPlayerA({id: "playerA", x: playerA.x, y: height * (player.y / 100)});
      }
      else if (player.id === "playerB" && props.room?.playerB.name !== props.playerName) {
        setPlayerB({id: "playerB", x: playerB.x, y: height * (player.y / 100)});
      }
    } );  
  }, [playerA, playerB, width, height, boardWidth, boardHeight, props.room, props.playerName]);
  useEffect(() => {
    props.socket?.on("ballMovement", (ball : any) => {
      setBall({id: "ball", x: width * (ball.x / 100), y: height * (ball.y / 100), direction: ball.direction, speed: ball.speed});
    });
  }, [ball, height, width]);
  function setDirection(e : any)
  {
    setBall({...ball, direction: e});
  }
  return (
      <div>
        <p>Game :</p>
        {props.room?.playerA.name === props.playerName ? (<button onClick={() => ballMovement()}>Bouge la baballe</button>) : null}
        {props.room?.playerA.name === props.playerName ? (<button onClick={() => resetBall()}>Reset la baballe</button>) : null}
        {props.room?.playerA.name === props.playerName ? (<button onClick={() => setBallActive(!ballActive)}>{ballActive ? "Stop" : "Start"} la baballe</button>) : null}
        {props.room?.playerA.name === props.playerName ? (<input type="number" onChange={(e) => setDirection(Number(e.target.value))} value={ball.direction} />): null}
        <GameBoard socket={props.socket} room={props.room}/>
        <Stage  width={width} height={height} className="gameMainCanvas">
      <Layer>
        <Text text="Game : ?" />
        <Rect width={9000} height={8000} x={0} y={0} fill="gray" />
        {<Circle draggable  x={ball.x} y={ball.y} radius={ballRadius} fill="red" />}
        {<Rect x={playerA.x} y={playerA.y} width={boardWidth} height={boardHeight} fill="blue"/>}
        {<Rect x={playerB.x} y={playerB.y} width={boardWidth} height={boardHeight} fill="green"/>}
      </Layer>
    </Stage>
      </div>
  );
}

export default GamePlay;
