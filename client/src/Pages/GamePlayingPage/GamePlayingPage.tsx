import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import GameReady from "../../Components/GameReady/GameReady";
import GamePlay from "../../Components/GamePlay/GamePlay";
import { createNotification } from "../../Components/notif/Notif";
import React from "react";
import NavBar from "../../Components/Nav/NavBar";
import "../../Pages/Home/HomePage.scss";
import { useDispatch, useSelector } from "react-redux";
import { getSockeGame, getSockeGameChat, setSocketGame } from "../../Redux/gameSlice";
import useEventListener from "@use-it/event-listener";
import KillSocket from "../../Components/KillSocket/KillSocket";

interface IPlayer {
  id: string;
  name: string;
  status: string;
  x: number;
  y: number;
}

interface IBall {
  x: number;
  y: number;
  speed: number;
  direction: number;
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
  confirmed: boolean;
}

interface ISettings {
  defaultSpeed: number;
  defaultDirection: number;
  boardWidth: number;
  boardHeight: number;
  ballRadius: number;
  background: string;
}

function GamePlayingPage() {
  const socket = useSelector(getSockeGame);
  const dispatch = useDispatch();
  const [ready, setReady] = useState<boolean>(false);
  const [playing, setPlaying] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [room, setRoom] = useState<IRoom>();
  const [notification, setNotificaton] = useState<Boolean>(false);

  const [friendList, SetFriendList] = useState<any[]>([]);
	const [blockList, SetBlockList] = useState<any[]>([]);
	const [requestedList, SetRequestedList] = useState<any[]>([]);
	const [requestList, SetRequestList] = useState<any[]>([]);
	const [profilePage, setProfilePage] = useState<any>(null);
	const [profileDisplayed, setProfileDisplayed] = useState<boolean>(false);
	const [historyList, SetHistoryList] = useState<any[]>([]);

  function test (e:any) {
    console.log("full", e);
  }
  function handleResize (e:any) {
    console.log("resize", e);
  }
  useEventListener("fullscreenchange", test);
  useEventListener("resize", handleResize);
  
	KillSocket("chat");
	KillSocket("spectate");

  useEffect(() => {
    // Connect to the socket
    console.log("socket", socket);
    if (socket)
      socket?.close();
    const newSocket = io("http://90.66.192.148:7002");
    dispatch(setSocketGame(newSocket));
  }, []);

  useEffect(() => {
    console.log("newSocket gfgdfgdf", socket)
    socket?.emit("searching");
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket?.removeListener("errorRoomIsFull");
      socket?.removeListener("playerReady");
      socket?.removeListener("gameStart");
      socket?.removeListener("playerDisconnected");
      socket?.removeListener("gameEnd");
      socket?.removeListener("gameForceEnd");
      socket?.removeListener("roomUpdated");
      socket?.on("errorRoomIsFull", (id: string) => {
        console.log("errorRoomIsFull", id);
        //window.location.href = '/game/';
        //Spectator here
      });
      socket?.on("playerReady", (data: IRoom) => {
        if (ready) {
          setRoom(data);
          console.log("hey gameStart", data);
          //if (data?.playerA?.id && data?.playerB?.id)
          //  setPlaying(true);
        }
      });
      socket?.on("gameStart", (data: IRoom) => {
        console.log("hey gameStart", data);
        setRoom(data);
        setPlaying(true);
        setReady(false);
        setNotificaton(false);
      });
      socket?.on("playerDisconnected", (data: IRoom) => {
        if (ready) {
          if (!notification)
            createNotification("info", "L'autre connard a leave 2");
          setNotificaton(true);
          console.log("aPlayerDisconnected : ", data);
          if (playing) {
            setPlaying(false);
            // C'est la merde faut pause la room
          } else setRoom(data);
        }
      });
      socket?.on("gameEnd", (data: IRoom) => {
        console.log("gameEnd", data);
        if (data.scoreA === 10 && !notification)
          createNotification("success", "PlayerA a gagner");
        else if (data.scoreB === 10 && !notification)
          createNotification("success", "PlayerB a gagner");
        setNotificaton(true);
        setRoom(data);
        setPlaying(false);
        setReady(false);
      });
      socket?.on("gameForceEnd", (data: IRoom) => {
        console.log(
          "gameForceEnd donc erreur 'sorry l'autre connard a crash'",
          data
        );
        if (!notification)
          createNotification("info", "L'autre connard a leave 3");
        setNotificaton(true);
        setRoom(data);
        setPlaying(false);
        setReady(false);
      });
      socket?.on("roomUpdated", (data: IRoom) => {
        console.log("roomUpdated", data);
        setRoom(data);
      });
    }
  }, [socket, ready, playing, room, notification]);
 // Modif navbar
  return (
    <div className="main">
      <NavBar socket={undefined} setSocket={undefined} 
	  friendList={friendList}
	  SetFriendList={SetFriendList}
	  blockList={blockList}
	  SetBlockList={SetBlockList}
	  requestList={requestList}
	  SetRequestList={SetRequestList}
	  requestedList={requestedList}
	  SetRequestedList={SetRequestedList}
	  setProfilePage={setProfilePage}
	  setProfileDisplayed={setProfileDisplayed}
	  SetHistoryList={SetHistoryList}/>
      {!ready && !playing ? (
        <GameReady
          socket={socket}
          setReady={setReady}
          setPlayerId={setPlayerId}
          setPlayerName={setPlayerName}
        />
      ) : null}
      {playing ? (
        <GamePlay
          playerName={playerName}
          playerId={playerId}
          socket={socket}
          room={room}
        />
      ) : null}
    </div>
  );
}

export default GamePlayingPage;
