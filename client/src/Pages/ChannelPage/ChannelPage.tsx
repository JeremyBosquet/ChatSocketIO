import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Channels from '../../Components/Channels/Channels';
import NavBar from '../../Components/Nav/NavBar';
import { getLogged, getUser, setLogged, setUser } from '../../Redux/authSlice';
import './ChannelPage.scss';
import "../../Pages/Home/HomePage.scss";
import { createNotification } from '../../Components/notif/Notif';
import { getSockeGameChat, setSocketGameChat } from '../../Redux/gameSlice';
import { io } from 'socket.io-client';
import GamePlay from '../../Components/GamePlay/GamePlay';
import GameReady from '../../Components/GameReady/GameReady';
import GameChatReady from '../../Components/GameChatReady/GameChatReady';
import KillSocket from '../../Components/KillSocket/KillSocket';


interface IPlayer {
	id: string;
	name: string;
	score: number;
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

function ChannelPage() {
	const logged = useSelector(getLogged);
    const user = useSelector(getUser);
    const dispatch = useDispatch();
	const socketGame = useSelector(getSockeGameChat);
	const navigate = useNavigate();
	const [inGame, setInGame] = useState<boolean>(false);
	const [ready, setReady] = useState<boolean>(false);
	const [playing, setPlaying] = useState<boolean>(false);
	const [playerId, setPlayerId] = useState<string>("");
	const [playerName, setPlayerName] = useState<string>("");
	const [room, setRoom] = useState<IRoom>();
	const [notification, setNotificaton] = useState<Boolean>(false);
	const [inviteGames, setInviteGames] = useState<IInvites[]>([]);

	const [friendList, SetFriendList] = useState<any[]>([]);
	const [blockList, SetBlockList] = useState<any[]>([]);
	const [requestedList, SetRequestedList] = useState<any[]>([]);
	const [requestList, SetRequestList] = useState<any[]>([]);
	const [profilePage, setProfilePage] = useState<any>(null);
	const [profileDisplayed, setProfileDisplayed] = useState<boolean>(false);
	const [historyList, SetHistoryList] = useState<any[]>([]);
  
	KillSocket("game");
	KillSocket("spectate");

	useEffect(() => {
		const getUserInfos = async () => {
			await axios
			.get(`http://90.66.192.148:7000/user`, {
			  headers: {
				Authorization: "Bearer " + localStorage.getItem("token"),
			  },
			})
			.then((res) => {
			  dispatch(setUser(res.data.User));
			  dispatch(setLogged(true));
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
	
	const handleChangeMode = (newMode: string) => {
		if (newMode === "channels")
			return ;
		if (newMode === "dm")
			navigate("/chat/dm")
	}

	// Game part
	useEffect(() => {
		// Connect to the socket
		if (socketGame)
			socketGame?.close();
		const newSocket = io("http://90.66.192.148:7002");
		dispatch(setSocketGameChat(newSocket));
	}, []);

	function quitGame() {
		setInGame(false);
		setReady(false);
		setPlaying(false);
		setPlayerId("");
		setPlayerName("");
		setRoom(undefined);
	}

	useEffect(() => {
		if (socketGame) {
			socketGame?.removeListener("errorRoomIsFull");
		  	socketGame?.removeListener("playerReady");
		  	socketGame?.removeListener("gameStart");
		  	socketGame?.removeListener("playerDisconnected");
		  	socketGame?.removeListener("gameEnd");
		  	socketGame?.removeListener("gameForceEnd");
		  	socketGame?.removeListener("roomUpdated");
		  	socketGame?.removeListener("gameFetchInvite");
		  
			socketGame.on("gameRemoveInvite", (data: any) => {
				if (data?.target && data?.room)
				{
					console.log("gameFetchInvite", data?.target, user.uuid)
					if (data?.target === user.uuid && data.room?.id)
					{
						setInviteGames(inviteGames.filter((invite) => invite.roomId !== data.room?.id));
					}
				}
			});

			socketGame.emit("gameAskInvite", {id: user.uuid});
			socketGame.on("gameFetchInvite", (data: any) => {
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
			setNotificaton(false);
			});
			socketGame?.on("playerDisconnected", (data: IRoom) => {
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
			setInGame(false);
			setRoom(undefined);
			setPlaying(false);
			setReady(false);
			quitGame();
			});
			socketGame?.on("gameEnd", (data: IRoom) => {
			console.log("gameEnd", data);
			if (data.playerA.score === 10 && !notification)
			  createNotification("success", "PlayerA a gagner");
			else if (data.playerB.score === 10 && !notification)
			  createNotification("success", "PlayerB a gagner");
			setNotificaton(true);
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
			if (!notification)
			  createNotification("info", "L'autre connard a leave 3");
			setNotificaton(true);
			setRoom(undefined);
			setPlaying(false);
			setReady(false);
			// quit game
			setInGame(false);
			quitGame();
			});
			socketGame?.on("roomUpdated", (data: IRoom) => {
			console.log("roomUpdated", data);
			setRoom(data);
			});
		}
	  }, [socketGame, ready, playing, room, notification, user, inviteGames]);
	
	return (
		<div className='main'>
		<NavBar 
			socket={undefined}
			setSocket={undefined}
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
			{!inGame ? (
		<div className='chatPage'>
			<div className='container'>
				<div className='selectChannelOrDm'>
					
					{logged === false ?
						<div className='notLogged'>
							<p>Pending...</p>
						</div>
 					:
					<>
						<button className="selectedButton" onClick={() => handleChangeMode("channels")}>Channels</button>
						<button className="selectedButton" onClick={() => handleChangeMode("dm")}>Private Messages</button>
						<Channels invites={inviteGames} />
					</>
				}
				</div>
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
	);
}

export default ChannelPage;
