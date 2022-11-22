import axios from "axios";
import io, { Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNotification } from "../../Components/notif/Notif";
// import { useDispatch, useSelector } from 'react-redux';
// import { getLogged, getUser, setLogged, setUser, getActivated, setActivated, getConnected, setConnected } from '../Redux/authSlice';
import "./HomePage.scss";
import {IoPersonRemoveSharp, IoPersonAddSharp} from 'react-icons/io5';
import {ImCross, ImCheckmark} from "react-icons/im";
import {MdCancelScheduleSend, MdBlock} from "react-icons/md";
import {CgUnblock} from "react-icons/cg";
import {AiOutlineClose} from "react-icons/ai";
import React from "react";
import NavBar from "../../Components/Nav/NavBar";
import {IsFriend, IsRequest, IsRequested, IsBlocked, AddOrRemoveFriend, CancelFriendAdd, AcceptFriend, DeclineFriendAdd, BlockOrUnblockUser, HideProfile} from "../../Components/Utils/socialCheck"
import {getExp, getMyExp} from '../../Components/Utils/getExp'
import { whoWon } from "../../Components/Utils/whoWon";
import KillSocket from "../../Components/KillSocket/KillSocket";

function HomePage() {
  let navigate = useNavigate();
  let tab: any[] = [];
  let requestTab: any[] = [];
  let friendTab: any[] = [];
	let requestedTab: any[] = [];
  const nbButton: number = 6;
  const [compt, setCompt] = useState<number>(0);
  //const [user, setUser] = useState<any>();
  const booleffect = useRef<boolean>(false);
  const [booleffect2, setbooleffect2] = useState<boolean>(true);
  const [booleffect3, setbooleffect3] = useState<boolean>(false);
  const firstrender = useRef<boolean>(true);
  const firstrender2 = useRef<boolean>(true);
  const [socket, setSocket] = useState<Socket>();
  const [myHistoryList, SetMyHistoryList] = useState<any[]>([]);

  const [checkedProfile, setCheckedProfile] = useState<boolean>(false);
  const [checkedSettings, setCheckedSettings] = useState<boolean>(false);
  const [checkedLogout, setCheckedLogout] = useState<boolean>(false);
  const [checkedGame, setCheckedGame] = useState<boolean>(false);
  const [checkedSpectate, setCheckedSpectate] = useState<boolean>(false);
  const [checkedSocial, setCheckedSocial] = useState<boolean>(false);
  const [User, setUser] = useState<any>();
  const [friendRequest, setFriendRequest] = useState<number>();
  const [ProfileExp, setProfileExp] = useState<any>();
  const [myProfileExp, setMyProfileExp] = useState<any>();


	const [friendList, SetFriendList] = useState<any[]>([]);
	const [blockList, SetBlockList] = useState<any[]>([]);
	const [requestedList, SetRequestedList] = useState<any[]>([]);
	const [requestList, SetRequestList] = useState<any[]>([]);
	const [profilePage, setProfilePage] = useState<any>(null);
	const [profileDisplayed, setProfileDisplayed] = useState<boolean>(false);
	const [historyList, SetHistoryList] = useState<any[]>([]);


	KillSocket("all");

  useEffect(() => {
    // Connect to the socket
    const newSocket = io("http://90.66.192.148:7003");
    setSocket(newSocket);
  }, []);

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
						SetRequestList(requestTab);
					else
						SetRequestList([]);
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
					const requested = requestedList.filter((e) => e.uuid !== data.friendUuid);
					SetRequestedList(requested);
					friendTab = res.data.friendList;
					SetFriendList(friendTab);
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
					SetFriendList(friendTab);
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
						SetRequestList(requestTab);
					else
						SetRequestList([]);
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
						SetRequestedList(requestedTab);
					else
						SetRequestedList([]);
				}).catch((err) => {
					console.log(err.message);
					//SetRequestList([]);
				});
			}
		});
	}
  }, [socket, User]);

  useEffect (() => {
	if (firstrender.current)
	{
		firstrender.current = false;
		return;
	}
	if (!booleffect3 &&  profilePage)
	{
		getExp(profilePage?.uuid, setProfileExp);
		setbooleffect3(true);
	}
	}), [profilePage];

	useEffect (() => {
		if (firstrender2.current)
		{
			firstrender2.current = false;
			return;
		}
		if (!booleffect2)
			if (User)
				getMyExp(User.uuid, setMyProfileExp);
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
      {!booleffect2 ? (
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
				<NavBar 
				socket={socket}
				setSocket={setSocket}
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
				SetHistoryList={SetHistoryList}
				setbooleffect3={setbooleffect3}/>
				<div id="myProfile">
					<img
					src={User?.image}
					alt="user_img"
					className="userImg"
					width="384"
					height="256"
					/>
					<div className="userInfo">
						<h3> {User?.username} </h3>
						<div className="expBar">
							<span className="myExp"> </span>
							<p>{myProfileExp}</p>
						</div>
						<div id="listMyGameParent">
						{myHistoryList.length ? 
						(
							myHistoryList.length > 3 ? 
							(
								<div id="listMyGameScroll">
								{myHistoryList.map((game, index) => (
									<ul key={index}>
									{whoWon(User.uuid,game.playerA,game.playerB,game.status) === "Victory" ? (
										<li>
										<span className="green">
											{game.playerA.name} vs {game.playerB.name} / {whoWon(User.uuid,game.playerA,game.playerB,game.status)}
										</span>
										</li>
									) : (
										<li>
										<span className="red">
											{game.playerA.name} vs {game.playerB.name} / {whoWon(User.uuid,game.playerA,game.playerB, game.status)}
										</span>
										</li>
									)}
									</ul>
								))}
								</div>
							)

							:

							(
								<div id="listMyGame">
								{myHistoryList.map((game, index) => (
									<ul key={index}>
									{whoWon(User.uuid,game.playerA,game.playerB,game.status) === "Victory" ? (
										<li>
										<span className="green">
											{game.playerA.name} vs {game.playerB.name} / {whoWon(User.uuid,game.playerA,game.playerB,game.status)}
										</span>
										</li>
									) : (
										<li>
										<span className="red">
											{game.playerA.name} vs {game.playerB.name} / {whoWon(User.uuid,game.playerA,game.playerB, game.status)}
										</span>
										</li>
									)}
									</ul>
								))}
								</div>
							)

						) : null}
						</div>
					</div>
				</div>
			</div>
			<div className="popup">
			{
				profileDisplayed ?
				(
					<>
						<button className="closeProfile" onClick={() =>  HideProfile('/' ,setProfileDisplayed, navigate, setbooleffect3)}>  <span><AiOutlineClose /></span> </button>
						<img className="ProfileImg" src={profilePage?.image} alt="user_img" width="384" height="256"/>
						<h3> {profilePage?.username} </h3>
						<div className="Buttons">
						<button onClick={() => (BlockOrUnblockUser(profilePage?.uuid , blockList, socket, User, friendList, SetFriendList, requestList, SetRequestList, requestedList, SetRequestedList, SetBlockList))} > {IsBlocked(profilePage?.uuid, blockList) ? <MdBlock/>: <CgUnblock/>} </button>
						{	IsRequested(profilePage?.uuid, requestedList) ?
							(
								IsRequest(profilePage?.uuid, requestList) ? 
								(
									<>
										<button onClick={() => (AddOrRemoveFriend(profilePage?.uuid, friendList, SetRequestedList, requestedList, socket, User, SetFriendList))} > {IsFriend(profilePage?.uuid, friendList) ? <IoPersonAddSharp/> : <IoPersonRemoveSharp/>} </button>
									</>
								)

								:

								(
									<>
										<button onClick={() => (AcceptFriend(profilePage?.uuid, profilePage?.image, requestList, SetRequestList, SetFriendList, friendList, socket, User))} > <span className='green'><ImCheckmark/></span> </button>
										<button onClick={(e) => (DeclineFriendAdd(profilePage?.uuid, requestList, SetRequestList, socket, User))} > <span className='red'><ImCross/></span> </button>
									</>
								)
		
							)
							:
								<button onClick={(e) => (CancelFriendAdd(profilePage?.uuid, requestedList, SetRequestedList, socket, User))} > <MdCancelScheduleSend/> </button>	
						}
						</div>
						<div className="expBar">
							<span className="exp"> </span>
							<p>{ProfileExp}</p>
						</div>
						<div id='listGameParent'>
						{
							true ?
							(
								historyList.length > 3 ?
								(
									<div id='listGameScroll'>
									{
										// historyList.map((game, index) => (
										// 	<ul key={index} >
										// 		{whoWon(profilePage.uuid, game.playerA, game.playerB, game.status) === 'Victory' ? 
												
										// 			<li> <span className='green'> {game.playerA.name} vs {game.playerB.name} / {whoWon(profilePage.uuid, game.playerA, game.playerB, game.status)}</span> </li>

										// 			:

										// 			<li> <span className='red'> {game.playerA.name} vs {game.playerB.name} / {whoWon(profilePage.uuid, game.playerA, game.playerB, game.status)}</span> </li>
													
										// 		}
										// 		<li> <span className='green'> this is test of history match </span> </li>
										// 		<li> <span className='red'> this is test of history match </span> </li>
										// 		<li> <span className='green'> this is test of history match </span> </li>
										// 		<li> <span className='red'> this is test of history match </span> </li>
										// 		<li> <span className='green'> this is test of history match </span> </li>
										// 	</ul>
										// ))
										<ul>
											<li> <span className='green'> this is test of history match </span> </li>
											<li> <span className='red'> this is test of history match </span> </li>
											<li> <span className='green'> this is test of history match </span> </li>
											<li> <span className='red'> this is test of history match </span> </li>
											<li> <span className='green'> this is test of history match </span> </li>
										</ul>
									}
									</div>
								)

								:

								(
									<div id='listGame'>
									{
										historyList.map((game, index) => (
											<ul key={index} >
												{whoWon(profilePage.uuid, game.playerA, game.playerB, game.status) === 'Victory' ? 
												
													<li> <span className='green'> {game.playerA.name} vs {game.playerB.name} / {whoWon(profilePage.uuid, game.playerA, game.playerB, game.status)}</span> </li>

													:

													<li> <span className='red'> {game.playerA.name} vs {game.playerB.name} / {whoWon(profilePage.uuid, game.playerA, game.playerB, game.status)}</span> </li>
													
												}
											</ul>
										))
										// <ul>
										// 	<li> <span className='green'> this is test of history match </span> </li>
										// 	<li> <span className='red'> this is test of history match </span> </li>
										// 	<li> <span className='green'> this is test of history match </span> </li>
										// 	<li> <span className='red'> this is test of history match </span> </li>
										// 	<li> <span className='green'> this is test of history match </span> </li>
										// </ul>
									}
									</div>
								)
							)

							:

							null
						}
						</div>
						
					</>
					
				)

				:

				(
					null
				)
			}
			</div>
			</>
          )}
        </>
      ) : null}
    </div>
  );
}

export default HomePage;
