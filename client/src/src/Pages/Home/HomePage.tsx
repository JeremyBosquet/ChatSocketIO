
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNotification } from "../../Components/notif/Notif";
import { useDispatch, useSelector } from 'react-redux';
import "./HomePage.scss";
import React from "react";
import NavBar from "../../Components/Nav/NavBar";
import { getMyExp } from '../../Components/Utils/getExp'
import { whoWon } from "../../Components/Utils/whoWon";
import KillSocket from "../../Components/KillSocket/KillSocket";
import { getSocketSocial, getFriendList, getBlockList, getRequestList, getRequestedList, getHistoryList, getProfileDisplayed, getProfilePage, getUserImg, getUserUsername, setUserUsername, setUserImg, setHistoryList} from "../../Redux/authSlice";
import { setFriendList, setRequestList, setRequestedList, setProfileDisplayed } from '../../Redux/authSlice'
import Popup from "../../Components/Popup/Popup";
import io, { Socket } from "socket.io-client";
import GameReady from "../../Components/GameReady/GameReady";
import GamePlay from "../../Components/GamePlay/GamePlay";
import "../../Pages/Home/HomePage.scss";
import { getSockeGame, getSockeGameChat, setSocketGame } from "../../Redux/gameSlice";
import useEventListener from "@use-it/event-listener";
import { useParams } from "react-router-dom";
import { getSocket } from "../../Redux/chatSlice";
import { modifyScores } from "../../Components/Utils/modifyScores";
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

function HomePage() {
	const navigate = useNavigate();
	let tab: any[] = [];
	const nbButton: number = 6;
	const [compt, setCompt] = useState<number>(0);
	const booleffect = useRef<boolean>(false);
	const [booleffect2, setbooleffect2] = useState<boolean>(true);
	const firstrender2 = useRef<boolean>(true);

	const [User, setUser] = useState<any>();
	const [trueUsername, setTrueUsername] = useState<string>("");
	const [friendRequest, setFriendRequest] = useState<number>();
	const [myProfileExp, setMyProfileExp] = useState<any>();
	const socketGame = useSelector(getSockeGame);
	const [ready, setReady] = useState<boolean>(false);
	const [playing, setPlaying] = useState<boolean>(false);
	const [playerId, setPlayerId] = useState<string>("");
	const [playerName, setPlayerName] = useState<string>("");
	const [room, setRoom] = useState<IRoom>();
	//const [notification, setNotificaton] = useState<Boolean>(false);
	const [display, setDisplay] = useState<boolean>(true);


	KillSocket("chat");
	KillSocket("spectate");
	const dispatch = useDispatch();

	const userImg = useSelector(getUserImg);
	const userUsername = useSelector(getUserUsername);
	const myHistoryList = useSelector(getHistoryList);
	useEffect(() => {
		// Connect to the socketGame
		console.log("socketGame", socketGame);
		if (socketGame)
			socketGame?.close();
		const newSocket = io(import.meta.env.VITE_URL_API + ":7002");
		dispatch(setSocketGame(newSocket));
	}, []);

	useEffect(() => {
		console.log("newSocket gfgdfgdf", socketGame)
		socketGame?.emit("searching");
	}, [socketGame]);

	socketGame?.removeListener("errorRoomIsFull");
	socketGame?.removeListener("playerReady");
	socketGame?.removeListener("gameStart");
	socketGame?.removeListener("playerDisconnected");
	socketGame?.removeListener("gameEnd");
	socketGame?.removeListener("gameForceEnd");
	socketGame?.removeListener("roomUpdated");
	socketGame?.on("errorRoomIsFull", (id: string) => {
		console.log("errorRoomIsFull", id);
		//window.location.href = '/game/';

		//Spectator here
	});

	socketGame?.on("playerReady", (data: IRoom) => {
		if (ready) {
			setRoom(data);
			console.log("hey gameStart", data);
		}
	});
	socketGame?.on("gameStart", (data: IRoom) => {
		console.log("hey gameStart", data);
		setRoom(data);
		setPlaying(true);
		setReady(false);
		//setNotificaton(false);
		setDisplay(false);
	});
	socketGame?.on("playerDisconnected", (data: IRoom) => {
		if (ready) {
				createNotification("info", "The other player has left the game");
			//setNotificaton(true);

			console.log("aPlayerDisconnected : ", data);
			if (playing) {
				setPlaying(false);
			} else setRoom(data);
		}
	});
	socketGame?.on("gameEnd", (data: IRoom) => {
		console.log("gameEnd", data);
		if (data.scoreA === 10)
			createNotification("success", "PlayerA a gagner");
		else if (data.scoreB === 10)
			createNotification("success", "PlayerB a gagner");
		//setNotificaton(true);
		setDisplay(true);
		setRoom(data);
		setPlaying(false);
		setReady(false);
	});
	socketGame?.on("gameForceEnd", (data: IRoom) => {
		console.log(
			"gameForceEnd donc erreur 'sorry l'autre connard a crash'",
			data
		);
			createNotification("info", "The other player has left the game");
		//setNotificaton(true);
		setRoom(data);
		setPlaying(false);
		setDisplay(true);

		setReady(false);
	});
	socketGame?.on("roomUpdated", (data: IRoom) => {
		if (room) // update scoreA and scoreB only
			setRoom({...room, scoreA: data.scoreA, scoreB: data.scoreB});
	});

	async function GetLoggedInfoAndUser() {
		if (localStorage.getItem("token")) {
			console.log("GetLoggedInfoAndUser");
			await instance.get(`user`, {
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((res) => {
					setUser(res.data.User);
					dispatch(setUserUsername(res.data.User.username));
					dispatch(setUserImg(import.meta.env.VITE_URL_API + ":7000/" + res.data.User.image));
					setTrueUsername(res.data.User.trueUsername);
					instance.get(`room/getGameOfUser/` + res.data.User.uuid,
					{
						headers: {
							Authorization: "Bearer " + localStorage.getItem("token"),
						},
					}).then((res) => {
						if (res.data && res.data.length)
							dispatch(setHistoryList(res.data));
						else if (res.data)
							dispatch(setHistoryList([]));
					});
					console.log(res.data.User);
				}).catch((err) => {
					console.log(err.message);
			});
			await instance.get(`user/ListFriendRequest`, {
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((res) => {
					tab = res.data.ListFriendsRequest;
					if (tab.length) {
						setFriendRequest(tab.length);
					} else setFriendRequest(0);
					setCompt(tab.length);
				})
				.catch((err) => {
					console.log(err.message);
					setFriendRequest(0);
				});
		}
		setbooleffect2(false);
	}

	async function reloadHistoryList() {
		await instance.get(`room/getGameOfUser/` + User.uuid,
		{
			headers: {
				Authorization: "Bearer " + localStorage.getItem("token"),
			},
		}).then((res) => {
			if (res.data && res.data.length)
				dispatch(setHistoryList(res.data));
			else if (res.data)
				dispatch(setHistoryList([]));
		});
	}

	useEffect(() => {
		GetLoggedInfoAndUser();
	}, []);

	useEffect(() => {
		if (User)
			reloadHistoryList();
	}, [playing]);

	useEffect(() => {
		if (User)
		{
			console.log("rcedw");
			getMyExp(User.uuid, setMyProfileExp);
		}
	}, [User, booleffect2, playing, display]);

	// useEffect(() => {
	// 	// if (booleffect.current)
	// 	// 	return;
	// 	if (User && myHistoryList.length)
	// 	{
	// 		myHistoryList.map((game, index) => {
	// 			modifyScores(User.uuid, game, setScoreA, setScoreB, scoreA, scoreB, index, index==(myHistoryList.length-1) ? true : false)
	// 		});
	// 		booleffect.current = true;
	// 	}
	// }, [myHistoryList, User]);

	return (
		<>
			{!booleffect2 && !ready && !playing ? (
				<div className="HomePage main">
					<>
						{!User ? (
							<>
								<h1 id="loginTitle">Ft_transcendance</h1>
								<button id="login" onClick={() => navigate("/login")}>
									login
								</button>
							</>
						) : (
							<>
								<div className='blur'>
									<NavBar />
									{display ? (
										<div id="myProfile">
											<img
												src={userImg}
												alt="user_img"
												className="userImg"
												width="384"
												height="256"
											/>
											<div className="userInfo">
												<h3> {userUsername} </h3>
												<h4> @{trueUsername} </h4>
												<div className="expBar">
													<span className="myExp"> </span>
													<p>{myProfileExp}</p>
												</div>
												<div id="listMyGameParent">
													{myHistoryList.length ?
														(
															<div id={myHistoryList.length > 4 ? "listMyGameScroll" : "listMyGame"}>
																{myHistoryList.map((game : any, index : number) => (
																	<ul key={index}>
																		<li>
																			<p id="playerName">
																				{game.playerA.name} vs {game.playerB.name}
																			</p>
																			<p id="playerStatus">
																				|&nbsp;&nbsp;{whoWon(User.uuid, game)}
																			</p>
																			<p id="playerScore">
																				|&nbsp;&nbsp;{game.scoreA < 0 ? (game.scoreA == -42 ? 0 : -game.scoreA) : game.scoreA} - {game.scoreB < 0 ? (game.scoreB == -42 ? 0 : -game.scoreB) : game.scoreB}
																			</p>
																		</li>
																	</ul>
																))}
															</div>
														)
														: null}
												</div>
											</div>
										</div>
									) : (null)}
									<GameReady
										socket={socketGame}
										setDisplay={setDisplay}
										setReady={setReady}
										setPlayerId={setPlayerId}
										setPlayerName={setPlayerName}
									/>
								</div>
							</>
						)}
						<Popup User={User} />
					</>
				</div>
			) : null}
			{!booleffect2 && playing && User ? (
				<>
					<NavBar />
					<GamePlay
						playerName={playerName}
						playerId={playerId}
						socket={socketGame}
						room={room}
					/>
				</>
			) : null}
		</>
	);
}

export default HomePage;
