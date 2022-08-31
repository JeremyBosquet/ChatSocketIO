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

interface ICanvasItem {
  x: number;
  y: number;
  id: string;
}

function GamePlay(props : props) {
  const [width, setWidth] = useState<number>(window.innerWidth/  1.2);
  const [height, setHeight] = useState<number>(window.innerHeight / 1.4);
  const [boardWidth, setBoardWidth] = useState<number>(width * 0.015);
  const [boardHeight, setBoardHeight] = useState<number>(height * 0.20);
  const [ballRadius, setBallRadius] = useState<number>(20);
  const [playerA, setPlayerA] = useState<ICanvasItem>({id: "playerA", x: width * 0.02, y: height * 0.5});
  const [playerB, setPlayerB] = useState<ICanvasItem>({id: "playerB", x: width - (width * 0.02), y: height * 0.5});
  const [ball, setBall] = useState<ICanvasItem>({id: "ball", x: width * 0.5, y: height * 0.5});
 
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
         _player.y -= height * 0.01;
          if (_player.y < 0)
          _player.y = 0;
        }
      }
      else if (e?.key === "ArrowDown") {
        if (_player.y + boardHeight < height) {
          _player.y += height * 0.01;
          if (_player.y + boardHeight > height)
          _player.y = height - boardHeight;
        }
      }
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
      setBallRadius(20);
      setBoardHeight(height * 0.20);
      setBoardWidth(width * 0.015);
      console.log(width, height, ballRadius, boardWidth, boardHeight);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [width, height, ballRadius, boardWidth, boardHeight]);

  useEffect(() => {
    props.socket?.on("playerMovement", (player : ICanvasItem) => {
      if (player.id === "playerA" && props.room?.playerA.name !== props.playerName) {
        setPlayerA({id: "playerA", x: width * (player.x / 100), y: height * (player.y / 100)});
      }
      else if (player.id === "playerB" && props.room?.playerB.name !== props.playerName) {
        setPlayerB({id: "playerB", x: width * (player.x / 100), y: height * (player.y / 100)});
      }
    } );  
  }, [playerA, playerB, width, height, boardWidth, boardHeight]);
  return (
      <div>
        <p>Game :</p>
        <GameBoard socket={props.socket} room={props.room}/>
        <Stage width={width} height={height} className="gameMainCanvas">
      <Layer>
        <Text text="Game : ?" />
        {<Circle x={ball.x} y={ball.y} radius={ballRadius} fill="red" />}
        {<Rect x={playerA.x} y={playerA.y} width={boardWidth} height={boardHeight} fill="blue"/>}
        {<Rect x={playerB.x} y={playerB.y} width={boardWidth} height={boardHeight} fill="green"
        />}
      </Layer>
    </Stage>
      </div>
  );
}

export default GamePlay;
