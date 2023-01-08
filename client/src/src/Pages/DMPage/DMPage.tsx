import React, { useEffect, useState } from 'react';
import { IoArrowBackOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import KillSocket from '../../Components/KillSocket/KillSocket';
import NavBar from '../../Components/Nav/NavBar';
import { createNotification } from '../../Components/notif/Notif';
import DM from '../../Components/PrivateMessages/DM/DM';
import PrivateMessages from '../../Components/PrivateMessages/PrivateMessages';
import { getLogged, getUser, setLogged, setUser } from '../../Redux/userSlice';
import { getDMs, setDMs } from '../../Redux/chatSlice';
import './DMPage.scss'
import instance from '../../API/Instance';
import { Helmet } from "react-helmet";
import { getSockeGameChat, setSocketGameChat } from '../../Redux/gameSlice';
import { io } from 'socket.io-client';
import GamePlay from '../../Components/GamePlay/GamePlay';
import GameChatReady from '../../Components/GameChatReady/GameChatReady';
import { IInvites, IRoom } from '../../Components/GamePlay/Interfarces/GameInterace';

function DMPage() {
	const logged = useSelector(getLogged);
	const user = useSelector(getUser);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const params = useParams();
	const [init, setInit] = useState<boolean>(false);
	const dms: [] = useSelector(getDMs);

	const socketGame = useSelector(getSockeGameChat);
	const [inGame, setInGame] = useState<boolean>(false);
	const [ready, setReady] = useState<boolean>(false);
	const [playing, setPlaying] = useState<boolean>(false);
	const [playerId, setPlayerId] = useState<string>("");
	const [playerName, setPlayerName] = useState<string>("");
	const [room, setRoom] = useState<IRoom>();
	const [inviteGames, setInviteGames] = useState<IInvites[]>([]);

	KillSocket("spectate");
	KillSocket("game");

	useEffect(() => {
		const getUsersDM = async (userId: any) => {
			await instance.get(`chat/dm/user`)
				.then((res) => {
					if (res)
						dispatch(setDMs(res.data));
					setInit(true);
				})
		}

		if (!init)
			getUsersDM(user.uuid);
		//eslint-disable-next-line
	}, [])

	useEffect(() => {
		const getUserInfos = async () => {
			await instance.get(`user`)
				.then((res) => {
					dispatch(setUser(res.data.User));
					dispatch(setLogged(true));
				})
				.catch(() => {
					setUser(undefined);
					createNotification("error", "User not found");
					localStorage.removeItem("token");
					navigate("/");
				});
		}

		if (localStorage.getItem("token"))
			getUserInfos();
	}, []);

	const handleChangeMode = (newMode: string) => {
		if (newMode === "channels")
			navigate("/chat/channel")
		if (newMode === "dm")
			return;
	}
	useEffect(() => {
		if (socketGame)
			socketGame?.close();
		const newSocket = io(import.meta.env.VITE_URL_API + ":7002");
		dispatch(setSocketGameChat(newSocket));
	}, []);

	function quitGame() {
		setInGame(false);
		setReady(false);
		setPlaying(false);
		setPlayerId("");
		setPlayerName("");
		setRoom(undefined);
		const newSocket = io(import.meta.env.VITE_URL_API + ":7002");
		socketGame?.close();
		dispatch(setSocketGameChat(newSocket));
	}

	socketGame?.removeListener("errorRoomIsFull");
	socketGame?.removeListener("playerReady");
	socketGame?.removeListener("gameStart");
	socketGame?.removeListener("playerDisconnected");
	socketGame?.removeListener("gameEnd");
	socketGame?.removeListener("gameForceEnd");
	socketGame?.removeListener("roomUpdated");
	socketGame?.removeListener("gameFetchInvite");

	socketGame?.on("gameRemoveInvite", (data: any) => {
		if (data?.target && data?.room) {
			if (data?.target === user.uuid && data.room?.id) {
				setInviteGames(inviteGames.filter((invite) => invite.roomId !== data.room?.id));
			}
		}
	});

	if (user)
		socketGame?.emit("gameAskInvite", { id: user.uuid });
	socketGame?.on("gameFetchInvite", (data: any) => {
		if (data?.target && data?.room && data?.switch == true) {
			if (data?.target === user.uuid) {
				setRoom(data?.room);
				setPlayerId(data?.target);
				setPlayerName(data?.targetName);
				setInGame(true);
				setReady(false);
				setPlaying(false);
			}
		}
		else if (data?.target && data?.room && data?.switch == false) {
			if (data?.target === user.uuid) {
				const newInvitation: IInvites = {
					requestFrom: data.room?.playerA.id,
					roomId: data.room?.id,
				}
				if (inviteGames.filter((invite) => invite.roomId === data.room.id).length === 0)
					setInviteGames([...inviteGames, newInvitation]);
			}
		}
	});

	socketGame?.on("playerReady", (data: IRoom) => {
		if (ready) {
			setRoom(data);
		}
	});
	socketGame?.on("gameStart", (data: IRoom) => {
		setRoom(data);
		setPlaying(true);
		setReady(false);
	});
	socketGame?.on("playerDisconnected", (data: IRoom) => {
		if (ready) {
			createNotification("info", "The other player has left the game");
			if (playing) {
				setPlaying(false);
			} else setRoom(data);
		}
		setInGame(false);
		setRoom(undefined);
		setPlaying(false);
		setReady(false);
		quitGame();
	});
	socketGame?.on("gameEnd", (data: IRoom) => {

		if (data.scoreA === 10)
			createNotification("success", (room?.playerA?.name != undefined ? room?.playerA.name : "PlayerA") + " won the game");
		else if (data.scoreB === 10)
			createNotification("success", (room?.playerB?.name != undefined ? room?.playerB.name : "PlayerB") + " won the game");
		setRoom(undefined);
		setPlaying(false);
		setReady(false);
		setInGame(false);
		quitGame();
	});
	socketGame?.on("gameForceEnd", (data: IRoom) => {
		createNotification("info", "The opponent has left the game");
		setRoom(undefined);
		setPlaying(false);
		setReady(false);
		setInGame(false);
		quitGame();
	});
	socketGame?.on("roomUpdated", (data: IRoom) => {
		if (room)
			setRoom({ ...room, scoreA: data.scoreA, scoreB: data.scoreB });
	});


	useEffect(() => {
		if (inGame || ready) {
			quitGame();
		}
	}, [params.id]);
	return (
		<>
			<div className="blur">
				<NavBar />
				{!inGame ? (
					<div className='chatPage'>
						<Helmet>
							<meta charSet="utf-8" />
							<title> Dm - transcendence </title>
							<link rel="icon" type="image/png" href="/logo.png" />
						</Helmet>
						<div className='container'>

							{logged === false ?
								<div className='notLogged'>
									<p>Pending...</p>
								</div>
								:
								<>
									{params.id ?
										(
											<div className="backButtonDiv">
												<button className="backButton" onClick={() => navigate('/chat/')}><IoArrowBackOutline className='backIcon' /> Back</button>
											</div>
										) : null
									}
									<div className={params.id ? 'leftSide hideSmall' : 'leftSide'}>
										<div className='topActions'>
											<div className='selectChannelOrDm'>
												<button className="selectedButton" onClick={() => handleChangeMode("channels")}>Channels</button>
												<button className="selectedButton" onClick={() => handleChangeMode("dm")}>DM</button>
											</div>
										</div>
										<div className='channelsInfos'>
											<div className='channelsInfo dmHeigthChange'>
												{dms && dms.map((channel: any) => (
													<DM key={channel["id"]} dm={channel} />
												))}
											</div>
										</div>
									</div>
									<PrivateMessages inviteGames={inviteGames} />
								</>
							}
						</div>
					</div>
				) : (
					<>
						{!ready && !playing && room ? (
							<GameChatReady
								room={room}
								quitGame={quitGame}
								socket={socketGame}
								setReady={setReady}
								setPlayerId={setPlayerId}
								setPlayerName={setPlayerName}
							/>
						) : null}
						{playing ? (
							<GamePlay
								playerName={playerName}
								playerId={playerId}
								socket={socketGame}
								room={room}
							/>
						) : null}
					</>
				)}
			</div>
		</>
	);
}

export default DMPage;
