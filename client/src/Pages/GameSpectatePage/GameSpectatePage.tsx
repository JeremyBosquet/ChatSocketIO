import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import GameReady from "../../Components/GameReady/GameReady";
import GamePlay from "../../Components/GamePlay/GamePlay";
import { createNotification } from "../../Components/notif/Notif";
import axios from "axios";
import RoomInfo from "../../Components/RoomInfo/RoomInfo";
import RoomSpectateInfo from "../../Components/RoomSpectateInfo/RoomSpectateInfo";
import { useNavigate, useParams } from "react-router-dom";
import GameSpectate from "../../Components/GameSpectate/GameSpectate";
import React from "react";
import NavBar from "../../Components/Nav/NavBar";
import "../../Pages/Home/HomePage.scss";
import { useDispatch, useSelector } from "react-redux";
import { getSockeGame, getSockeSpectate, setSocketGame, setSocketSpectate } from "../../Redux/gameSlice";
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

function GameSpectatePage() {
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [room, setRoom] = useState<IRoom>();
  const [notification, setNotificaton] = useState<Boolean>(false);
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useDispatch();
  const socket = useSelector(getSockeSpectate);
  const [display, setDisplay] = useState<Boolean>(false);

  const [friendList, SetFriendList] = useState<any[]>([]);
	const [blockList, SetBlockList] = useState<any[]>([]);
	const [requestedList, SetRequestedList] = useState<any[]>([]);
	const [requestList, SetRequestList] = useState<any[]>([]);
	const [profilePage, setProfilePage] = useState<any>(null);
	const [profileDisplayed, setProfileDisplayed] = useState<boolean>(false);
	const [historyList, SetHistoryList] = useState<any[]>([]);

  
	KillSocket("game");
	KillSocket("chat");

  const getRooms = async (e: any) => {
    const messages = await axios.get(
      `http://90.66.192.148:7000/api/room/getRoomSpectates`
    );

    if (messages?.data) {
      setRooms(messages.data);
    }
  };
  useEffect(() => {
    // Connect to the socket
    console.log("socket", socket);
    if (socket)
      socket?.close();
    const newSocket = io("http://90.66.192.148:7002");
    dispatch(setSocketSpectate(newSocket));
    getRooms(null);
  }, []);
  useEffect(() => {
    // Event listener from socket server
    socket?.on("roomStarted", (room: IRoom) => {
      setRooms([...rooms, room]);
    });
  }, [socket]);
  useEffect(() => {
    // Event listener from socket server
    socket?.on("roomFinished", (room: IRoom) => {
      setRooms((rooms) => rooms.filter((r) => r.id !== room.id));
    });
  }, [socket]);
  useEffect(() => {
    if (socket && roomId && roomId.length > 0) {
      socket.removeListener("gameEnd");
      socket.removeListener("gameForceEnd");
      socket.removeListener("roomUpdated");
      socket.removeListener("gameInit");
      socket.removeListener("errorRoomNotFound");
      socket?.emit("joinRoomSpectate", { roomId: roomId });
      socket?.on("errorRoomNotFound", (room: IRoom) => {
        navigate("/game/spectate");
      });
      socket.on("gameInit", (room: IRoom) => {
        setRoom(room);
        setNotificaton(false);
      });
      socket.on("gameEnd", (data: IRoom) => {
        console.log("gameEnd", data);
        if (data.scoreA === 10 && !notification)
          createNotification("success", "PlayerA a gagner");
        else if (data.scoreB === 10 && !notification)
          createNotification("success", "PlayerB a gagner");
        setNotificaton(true);
        setDisplay(false);
        setRoom(undefined);
        navigate("/game/spectate");
      });
      socket.on("gameForceEnd", (data: IRoom) => {
        console.log(
          "gameForceEnd donc erreur 'sorry l'autre connard a crash'",
          data
        );
        if (!notification)
          createNotification("info", "L'autre connard a leave 3");
        setNotificaton(true);
        setDisplay(false);
        setRoom(undefined);
        navigate("/game/spectate");
      });
      socket.on("roomUpdated", (data: IRoom) => {
        console.log("roomUpdated", data);
        setRoom(data);
      });
    }
  }, [socket, roomId, navigate, notification]);

  useEffect(() => {
    const checkId = async () => {
      if (roomId) {
        console.log("room", roomId);
        const result = await axios.get(`http://90.66.192.148:7000/api/room/checkGame/` + roomId);
        if (result.data) {
          setDisplay(true);
        }
        else {
          navigate("/game/spectate");
          setDisplay(false);
        }
        console.log("result", result.data);
      }
    };
    checkId();
  }, [roomId]);

  return (
    <div className="main">
      { <NavBar 
			socket={null}
			setSocket={null}
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
			SetHistoryList={SetHistoryList}/> }
      {!roomId ? (
        <div>
          <p>List of game :</p>
          {rooms.map((room: IRoom) => (
            <RoomSpectateInfo
              key={room.id}
              id={room.id}
              owner={room.owner}
              status={room.status}
              nbPlayers={room.nbPlayers}
              name={room.name}
              createdAt={room.createdAt}
              settings={room.settings}
            />
          ))}
        </div>
      ) : (
        <div>
          {room ? <GameSpectate socket={socket} room={room} /> : null}
        </div>
      )}
    </div>
  );
}

export default GameSpectatePage;
