import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import GameReady from "../../Components/GameReady/GameReady";
import GamePlay from "../../Components/GamePlay/GamePlay";
import { createNotification } from "../../Components/notif/Notif";

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
import Popup from "../../Components/Popup/Popup";
import { getUser, setUser } from "../../Redux/authSlice";
import instance from "../../API/Instance";

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
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const socket = useSelector(getSockeSpectate);
  const [display, setDisplay] = useState<Boolean>(false);
  
	KillSocket("game");
	KillSocket("chat");

  const getRooms = async (e: any) => {
    const messages = await instance.get(
      `room/getRoomSpectates`
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
    const newSocket = io(import.meta.env.VITE_URL_API + ":7002");
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
      //console.log("id", user.id);
      socket?.emit("joinRoomSpectate", { roomId: roomId, id: user?.uuid });
      socket?.on("errorRoomNotFound", (room: IRoom) => {
        navigate("/game/spectate");
      });
      socket.on("gameInit", (room: IRoom) => {
        setRoom(room);
        //setNotificaton(false);
      });
      socket.on("gameEnd", (data: IRoom) => {
        console.log("gameEnd", data);
        if (data.scoreA === 10 )
          createNotification("success", "PlayerA a gagner");
        else if (data.scoreB === 10)
          createNotification("success", "PlayerB a gagner");
        //setNotificaton(true);
        setDisplay(false);
        setRoom(undefined);
        navigate("/game/spectate");
      });
      socket.on("gameForceEnd", (data: IRoom) => {
        console.log(
          "gameForceEnd donc erreur 'sorry l'autre connard a crash'",
          data
        );
          createNotification("info", "L'autre connard a leave 3");
        //setNotificaton(true);
        setDisplay(false);
        setRoom(undefined);
        navigate("/game/spectate");
      });
			socket?.on("roomUpdated", (data: IRoom) => {
				if (room) // update scoreA and scoreB only
					setRoom({...room, scoreA: data.scoreA, scoreB: data.scoreB});
			});
    }
  }, [socket, roomId, navigate]);

  useEffect(() => {
    const checkId = async () => {
      if (roomId) {
        console.log("room", roomId);
        const result = await instance.get(`room/checkGame/` + roomId);
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

  useEffect(() => {
	const getUserInfos = async () => {
		await instance
		.get(`user`, {
		  headers: {
			Authorization: "Bearer " + localStorage.getItem("token"),
		  },
		})
		.then((res) => {
		  dispatch(setUser(res.data.User));
		})
		.catch((err) => {
		  setUser({});
		  createNotification("error", "User not found");
		  navigate("/");
		});
	}

	if (localStorage.getItem("token"))
		getUserInfos();
}, []);

  return (
	<>
		<div className='blur'>
			<div className="main">
			{ <NavBar /> }
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
				{room ? <GameSpectate setRoom={setRoom} socket={socket} room={room} /> : null}
				</div>
			)}
			</div>
		</div>
		<Popup User={user}/>
	</>
  );
}

export default GameSpectatePage;
