import React, { useEffect, useState } from 'react';

import { IoArrowBackOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import KillSocket from '../../Components/KillSocket/KillSocket';
import NavBar from '../../Components/Nav/NavBar';
import { createNotification } from '../../Components/notif/Notif';
import Popup from '../../Components/Popup/Popup';
import DM from '../../Components/PrivateMessages/DM/DM';
import PrivateMessages from '../../Components/PrivateMessages/PrivateMessages';
import { getLogged, getUser, setLogged, setUser } from '../../Redux/authSlice';
import { getDMs, getMode, setDMs } from '../../Redux/chatSlice';
import './DMPage.scss'
import instance from '../../API/Instance';
import {Helmet} from "react-helmet";
import { getSockeGameChat, setSocketGameChat } from '../../Redux/gameSlice';
import { io } from 'socket.io-client';
import GamePlay from '../../Components/GamePlay/GamePlay';
import GameChatReady from '../../Components/GameChatReady/GameChatReady';


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
	scoreA: number;
	scoreB: number;
	playerA: IPlayer;
	playerB: IPlayer;
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

  interface IInvites {
	requestFrom: string;
	roomId: string;
  }

function DMPage() {
	const logged = useSelector(getLogged);
    const user = useSelector(getUser);
    const dispatch = useDispatch();
	const navigate = useNavigate();
	const params = useParams();
    const [init, setInit] = useState<boolean>(false);
	const dms : [] = useSelector(getDMs);

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
			  createNotification("error", "User not found");
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
			return ;
	}
	useEffect(() => {
		// Connect to the socket
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
		// Re create the socket
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
				console.log("gameRemoveInvite", data);
				if (data?.target && data?.room)
				{
					console.log("gameFetchInvite", data?.target, user.uuid)
					if (data?.target === user.uuid && data.room?.id)
					{
						setInviteGames(inviteGames.filter((invite) => invite.roomId !== data.room?.id));
					}
				}
			});

			socketGame?.emit("gameAskInvite", {id: user.uuid});
			socketGame?.on("gameFetchInvite", (data: any) => {
				if (data?.target && data?.room && data?.switch == true)
				{
					console.log("gameFetchInvite", data?.target, user.uuid)
					if (data?.target === user.uuid)
					{
						console.log("gameFetchInvite", data)
						setRoom(data?.room);
						setPlayerId(data?.target);
						setPlayerName(data?.targetName);
						setInGame(true);
						setReady(false);
						setPlaying(false);
					}
				}
				else if (data?.target && data?.room && data?.switch == false)
				{
					if (data?.target === user.uuid)
					{
						const newInvitation : IInvites = {
							requestFrom : data.room?.playerA.id,
							roomId: data.room?.id, 
						}
						if (inviteGames.filter((invite) => invite.roomId === data.room.id).length === 0)
							setInviteGames([...inviteGames, newInvitation]);
					}
				}
			});

			socketGame?.on("errorRoomIsFull", (id: string) => {
			console.log("errorRoomIsFull", id);
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
			//setNotificaton(false);
			});
			socketGame?.on("playerDisconnected", (data: IRoom) => {
			if (ready) {
			  //if (!notification)
				createNotification("info", "The other player has left the game");
			  //setNotificaton(true);
			  console.log("aPlayerDisconnected : ", data);
			  if (playing) {
				setPlaying(false);
				// C'est la merde faut pause la room
			  } else setRoom(data);
			}
			setInGame(false);
			setRoom(undefined);
			setPlaying(false);
			setReady(false);
			quitGame();
			});
			socketGame?.on("gameEnd", (data: IRoom) => {
			console.log("gameEnd", data);
			if (data.scoreA === 10)
			  createNotification("success", "PlayerA a gagner");
			else if (data.scoreB === 10)
			  createNotification("success", "PlayerB a gagner");
			//setNotificaton(true);
			setRoom(undefined);
			setPlaying(false);
			setReady(false);
			setInGame(false);
			quitGame();
			});
			socketGame?.on("gameForceEnd", (data: IRoom) => {
			console.log(
			  "gameForceEnd donc erreur 'sorry l'autre connard a crash'",
			  data
			);
			  createNotification("info", "The other asshole has crashed");
			//setNotificaton(true);
			setRoom(undefined);
			setPlaying(false);
			setReady(false);
			// quit game
			setInGame(false);
			quitGame();
			});
			socketGame?.on("roomUpdated", (data: IRoom) => {
				if (room) // update scoreA and scoreB only
					setRoom({...room, scoreA: data.scoreA, scoreB: data.scoreB});
			});
		
	  
	useEffect(() => {
		// If in game or configuring during a url change we need to quit the game
		if (inGame || ready) {
			quitGame();
		}
	}, [params.id]);
	return (
		<>
		<div className="blur">
			<NavBar/>
				{!inGame ? (
			<div className='chatPage'>
				<Helmet>
					<meta charSet="utf-8" />
					<title> Dm - transcendence </title>
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
									<button className="backButton" onClick={() => navigate('/chat/')}><IoArrowBackOutline className='backIcon'/> Back</button>
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
									{dms && dms.map((channel : any) => (
										<DM key={channel["id"]} dm={channel} />
									))}
								</div>
							</div>
						</div>
						<PrivateMessages inviteGames={inviteGames}/>
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
