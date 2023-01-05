import { useEffect, useState } from "react";
import io from "socket.io-client";
import { createNotification } from "../../Components/notif/Notif";
import RoomSpectateInfo from "../../Components/RoomSpectateInfo/RoomSpectateInfo";
import { useNavigate, useParams } from "react-router-dom";
import GameSpectate from "../../Components/GameSpectate/GameSpectate";
import React from "react";
import NavBar from "../../Components/Nav/NavBar";
import "../../Pages/Home/HomePage.scss";
import { useDispatch, useSelector } from "react-redux";
import { getSockeSpectate, setSocketSpectate } from "../../Redux/gameSlice";
import KillSocket from "../../Components/KillSocket/KillSocket";
import { getUser, setUser } from "../../Redux/userSlice";
import instance from "../../API/Instance";
import './GameSpectatePage.scss'
import { Helmet } from "react-helmet";

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
	lastActivity: number;
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
		if (socket)
			socket?.close();
		const newSocket = io(import.meta.env.VITE_URL_API + ":7002");
		dispatch(setSocketSpectate(newSocket));
		getRooms(null);
	}, []);
	useEffect(() => {
		socket?.on("roomStarted", (room: IRoom) => {
			setRooms([...rooms, room]);
		});
	}, [socket]);
	useEffect(() => {
		socket?.on("roomFinished", (room: IRoom) => {
			setRooms((rooms) => rooms.filter((r) => r.id !== room.id));
		});
	}, [socket]);
	useEffect(() => {
		if (socket && roomId && display && roomId.length > 0) {
			socket.removeListener("gameEnd");
			socket.removeListener("gameForceEnd");
			socket.removeListener("roomUpdated");
			socket.removeListener("gameInit");
			socket.removeListener("errorRoomNotFound");
			socket?.emit("joinRoomSpectate", { roomId: roomId, id: user?.uuid });
			socket?.on("errorRoomNotFound", (room: IRoom) => {
				navigate("/game/spectate");
			});
			socket.on("gameInit", (room: IRoom) => {
				setRoom(room);
			});
			socket.on("gameEnd", (data: IRoom) => {
				if (data.scoreA === 10)
					createNotification("success", (room?.playerA?.name != undefined ? room?.playerA.name : "PlayerA") + " won the game");
				else if (data.scoreB === 10)
					createNotification("success", (room?.playerB?.name != undefined ? room?.playerB.name : "PlayerB") + " won the game");
				setDisplay(false);
				setRoom(undefined);
				navigate("/game/spectate");
			});
			socket.on("gameForceEnd", (data: IRoom) => {
				createNotification("info", "The opponent has left the game");
				setDisplay(false);
				setRoom(undefined);
				navigate("/game/spectate");
			});
			socket?.on("roomUpdated", (data: IRoom) => {
				if (room)
					setRoom({ ...room, scoreA: data.scoreA, scoreB: data.scoreB });
			});
		}
	}, [socket, roomId, display]);

	useEffect(() => {
		const checkId = async () => {
			if (roomId) {
				const result = await instance.get(`room/checkGame/` + roomId).then((res) => {
					setDisplay(true);
					console.log(res);
				})
				.catch((err) => {
					navigate("/game/spectate");
					setDisplay(false);
				});
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
					setUser(undefined);
					createNotification("error", "User not found");
					navigate("/");
				});
		}

		if (localStorage.getItem("token"))
			getUserInfos();
	}, []);

	return (
		<>
			{<NavBar />}
			<div className='roomPage'>
				<Helmet>
					<meta charSet="utf-8" />
					<title> Spectate - transcendence </title>
				</Helmet>
				{!roomId ? (
					<div className='container'>
						<h3 className="title">Current's game</h3>
						<div className="roomInfos">
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
									lastActivity={room.lastActivity}
									playerAName={room.playerA?.name}
									playerBName={room.playerB?.name}
									scoreA={room.scoreA}
									scoreB={room.scoreB}
									playerAId={room.playerA?.id}
									playerBId={room.playerB?.id}
								/>
							))}
						</div>
					</div>
				) : (
					<div>
						{room ? <GameSpectate setRoom={setRoom} socket={socket} room={room} /> : null}
					</div>
				)}
			</div>
		</>
	);
}

export default GameSpectatePage;
