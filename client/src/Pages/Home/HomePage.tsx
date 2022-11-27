import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNotification } from "../../Components/notif/Notif";
import { useDispatch, useSelector } from 'react-redux';
import "./HomePage.scss";
import React from "react";
import NavBar from "../../Components/Nav/NavBar";
import {getMyExp} from '../../Components/Utils/getExp'
import { whoWon } from "../../Components/Utils/whoWon";
import KillSocket from "../../Components/KillSocket/KillSocket";
import { getSocketSocial, getFriendList, getBlockList, getRequestList, getRequestedList, getHistoryList, getProfileDisplayed, getProfilePage, getUserImg, getUserUsername, setUserUsername, setUserImg } from "../../Redux/authSlice";
import {setFriendList, setRequestList, setRequestedList, setProfileDisplayed} from '../../Redux/authSlice'
import Popup from "../../Components/Popup/Popup";
import io, { Socket } from "socket.io-client";
import GameReady from "../../Components/GameReady/GameReady";
import GamePlay from "../../Components/GamePlay/GamePlay";
import "../../Pages/Home/HomePage.scss";
import { getSockeGame, getSockeGameChat, setSocketGame } from "../../Redux/gameSlice";
import useEventListener from "@use-it/event-listener";
import { useParams } from "react-router-dom";

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
  let requestTab: any[] = [];
  let friendTab: any[] = [];
	let requestedTab: any[] = [];
  const nbButton: number = 6;
  const [compt, setCompt] = useState<number>(0);
  //const [user, setUser] = useState<any>();
  const booleffect = useRef<boolean>(false);
  const [booleffect2, setbooleffect2] = useState<boolean>(true);
  //const [booleffect3, setbooleffect3] = useState<boolean>(false);
  const firstrender2 = useRef<boolean>(true);
//   const [socket, setSocket] = useState<Socket>();
  const [myHistoryList, SetMyHistoryList] = useState<any[]>([]);

  const [checkedProfile, setCheckedProfile] = useState<boolean>(false);
  const [checkedSettings, setCheckedSettings] = useState<boolean>(false);
  const [checkedLogout, setCheckedLogout] = useState<boolean>(false);
  const [checkedGame, setCheckedGame] = useState<boolean>(false);
  const [checkedSpectate, setCheckedSpectate] = useState<boolean>(false);
  const [checkedSocial, setCheckedSocial] = useState<boolean>(false);
  const [User, setUser] = useState<any>();
  const [friendRequest, setFriendRequest] = useState<number>();
  const [myProfileExp, setMyProfileExp] = useState<any>();
  const socketGame = useSelector(getSockeGame);
  const [ready, setReady] = useState<boolean>(false);
  const [playing, setPlaying] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [room, setRoom] = useState<IRoom>();
  const [notification, setNotificaton] = useState<Boolean>(false);
  const [display, setDisplay] = useState<boolean>(true);


	KillSocket("chat");
	KillSocket("spectate");
	const dispatch = useDispatch();

	const socket = useSelector(getSocketSocial);
	const requestedList = useSelector(getRequestedList);
	const userImg = useSelector(getUserImg);
	const userUsername = useSelector(getUserUsername);
	useEffect(() => {
		// Connect to the socketGame
		console.log("socketGame", socketGame);
		if (socketGame)
		  socketGame?.close();
		const newSocket = io("http://90.66.192.148:7002");
		dispatch(setSocketGame(newSocket));
	  }, []);
	
	  useEffect(() => {
		console.log("newSocket gfgdfgdf", socketGame)
		socketGame?.emit("searching");
	  }, [socketGame]);
	
	  useEffect(() => {
		if (socketGame) {
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
			  //if (data?.playerA?.id && data?.playerB?.id)
			  //  setPlaying(true);
			}
		  });
		  socketGame?.on("gameStart", (data: IRoom) => {
			console.log("hey gameStart", data);
			setRoom(data);
			setPlaying(true);
			setReady(false);
			setNotificaton(false);
			setDisplay(false);
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
		  });
		  socketGame?.on("gameEnd", (data: IRoom) => {
			console.log("gameEnd", data);
			if (data.scoreA === 10 && !notification)
			  createNotification("success", "PlayerA a gagner");
			else if (data.scoreB === 10 && !notification)
			  createNotification("success", "PlayerB a gagner");
			setNotificaton(true);
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
			if (!notification)
			  createNotification("info", "L'autre connard a leave 3");
			setNotificaton(true);
			setRoom(data);
			setPlaying(false);
			setDisplay(true	);
			
			setReady(false);
		  });
		  socketGame?.on("roomUpdated", (data: IRoom) => {
			console.log("roomUpdated", data);
			setRoom(data);
		  });
		}
	  }, [socketGame, ready, playing, room, notification]);

  useEffect(() => {
	if (socket) {
		socket.removeAllListeners();
		socket.on("newFriend", (data: any) => {
			if (data.uuid === User.uuid && data?.username) {
				createNotification("info", "New friend request from: " + data.username);
				axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
				}).then((res) => {
					requestTab = res.data.usernameList;
					if (requestTab.length)
						dispatch(setRequestList(requestTab));
					else
						dispatch(setRequestList([]));
				}).catch((err) => {
					console.log(err.message);
					// SetRequestList([]);
				});
			}
		});
		socket.on("friendAccepted", (data: any) => {
			if (data.uuid === User.uuid && data?.username && data?.friendUuid) {
				createNotification("info", data.username + " accepted your friend request");
				axios.get(`http://90.66.192.148:7000/user/ListFriends`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
				}).then((res) => {
					const requested = requestedList.filter((e : any) => e.uuid !== data.friendUuid);
					dispatch(setRequestedList(requested));
					friendTab = res.data.friendList;
					dispatch(setFriendList(friendTab));
				}).catch((err) => {
					console.log(err.message);
				});
			}
		});
		socket.on("removedOrBlocked", (data: any) => {
			if (data.uuid === User.uuid && data?.username) {
				//createNotification("info", data.username + " accepted your friend request");
				axios.get(`http://90.66.192.148:7000/user/ListFriends`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
				}).then((res) => {
					friendTab = res.data.friendList;
					dispatch(setFriendList(friendTab));
				}).catch((err) => {
					console.log(err.message);
				});
			}
		});
		socket.on("CancelFriend", (data: any) => {
			if (data.uuid === User.uuid) {
				axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
				}).then((res) => {
					requestTab = res.data.usernameList;
					if (requestTab.length)
						dispatch(setRequestList(requestTab));
					else
						dispatch(setRequestList([]));
				}).catch((err) => {
					console.log(err.message);
					//SetRequestList([]);
				});
			}
		});
		socket.on("DeclineFriend", (data: any) => {
			if (data.uuid === User.uuid) {
				axios.get(`http://90.66.192.148:7000/user/ListFriendRequested`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
				}).then((res) => {
					requestedTab = res.data.ListFriendsRequested;
					if (requestedTab.length)
						dispatch(setRequestedList(requestedTab));
					else
						dispatch(setRequestedList([]));
				}).catch((err) => {
					console.log(err.message);
					//SetRequestList([]);
				});
			}
		});
	}

  }, [socket, User]);

	useEffect (() => {
		if (firstrender2.current)
		{
			firstrender2.current = false;
			return;
		}
		if (!booleffect2)
			if (User)
				getMyExp(User.uuid, setMyProfileExp, setUser);
	}), [User];

  async function GetLoggedInfoAndUser() {
    if (localStorage.getItem("token")) {
      await axios
        .get(`http://90.66.192.148:7000/user/getLoggedInfo`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((res) => {
          // setLogged(res.data.IsLoggedIn);
          // setActivated(res.data.isTwoFactorAuthenticationEnabled);
          // setConnected(res.data.isSecondFactorAuthenticated);
        })
        .catch((err) => {
          console.log(err.message);
          setUser(undefined);
        });
      await axios.get(`http://90.66.192.148:7000/user`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((res) => {
			setUser(res.data.User);
			dispatch(setUserImg(res.data.User.image));
			dispatch(setUserUsername(res.data.User.username));
			axios
			  .get(
				`http://90.66.192.148:7000/api/room/getGameOfUser/` +
				  res.data.User.uuid,
				{
				  headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				  },
				}
			  )
			  .then((res) => {
				if (res.data && res.data.length)
					SetMyHistoryList(res.data);
				else if (res.data)
					SetMyHistoryList([]);
			  });
			console.log(res.data.User);
			}).catch((err) => {
				console.log(err.message);
				setUser(undefined);
		});
      await axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
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

  useEffect(() => {
    if (!booleffect.current) {
      GetLoggedInfoAndUser();
      booleffect.current = true;
    }
  }, []);

  return (
    <div className="HomePage main">
      {!booleffect2 && !ready && !playing  ? (
        <>
          {!User ? (
            <div>
              <button id="login" onClick={() => navigate("/login")}>
                login
              </button>
            </div>
          ) : (
			<>
			<div className='blur'>
				<NavBar/>
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
						<div className="expBar">
							<span className="myExp"> </span>
							<p>{myProfileExp}</p>
						</div>
						<div id="listMyGameParent">
							{myHistoryList.length ?
							(
							<div id={myHistoryList.length > 3 ? "listMyGameScroll" : "listMyGame"}>
							{myHistoryList.map((game, index) => (
								<ul key={index}>
								{whoWon(User.uuid, game) === "Victory" ? (
									<li>
									<span className="green">
										{game.playerA.name} vs {game.playerB.name} / {whoWon(User.uuid, game)}
									</span>
									</li>
								) : (
									<li>
									<span className="red">
										{game.playerA.name} vs {game.playerB.name} / {whoWon(User.uuid, game)}
									</span>
									</li>
								)}
								</ul>
							))}
							</div>
							)
							: null}
						</div>
					</div>
				</div>
				) : (null)}
			</div>
			<GameReady
			socket={socketGame}
			setDisplay={setDisplay}
			setReady={setReady}
			setPlayerId={setPlayerId}
			setPlayerName={setPlayerName}
			/>
			</>
          )}
		<Popup User={User} />
        </>
      ) : null}
	  {!booleffect2 && playing && User ? (
		<>
			<NavBar/>
        	<GamePlay
        	  playerName={playerName}
        	  playerId={playerId}
        	  socket={socketGame}
        	  room={room}
        	/>
			</>
      ) : null}
	</div>
  );
}

export default HomePage;
