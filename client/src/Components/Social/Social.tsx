import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useNavigation, } from "react-router-dom"
import { createNotification } from '../notif/Notif';
import io, { Socket } from 'socket.io-client';
import { Link, useLocation } from 'react-router-dom';
import { whoWon } from '../Utils/whoWon';
import React from 'react';
//const style = require('./Social.scss');
import './Social.scss';
import NavBar from '../Nav/NavBar';
import {IoPersonRemoveSharp, IoPersonAddSharp, IoSearchSharp} from 'react-icons/io5';
import { FaUserCircle, FaUserFriends } from "react-icons/fa";
import {ImCross, ImCheckmark} from "react-icons/im";
import {MdCancelScheduleSend, MdBlock} from "react-icons/md";
import {CgUnblock} from "react-icons/cg";
import {IsFriend, IsRequest, IsRequested, IsBlocked, AddOrRemoveFriend, CancelFriendAdd, AcceptFriend, DeclineFriendAdd, BlockOrUnblockUser} from "../../Components/Utils/socialCheck"
import { useSelector } from 'react-redux';
import { getSocketSocial } from '../../Redux/authSlice';


function Social(props: any) {
	let navigate = useNavigate();
	let location = useLocation();
	const booleffect = useRef<boolean>(false);
	const booleffect2 = useRef<boolean>(false);
	const [booleffect3, setbooleffect3] = useState<boolean>(true);
	const token = localStorage.getItem('token');
	let boolFriendOrNot : boolean = false;

	const socketSocial = useSelector(getSocketSocial);

	const [friendRequest, setFriendRequest] = useState<number>();
	//const [requestList, SetRequestList] = useState<any[]>([]);
	const firstrender = useRef<boolean>(true);
	//const [socket, setSocket] = useState<Socket>();
	// const [friendList, SetFriendList] = useState<any[]>([]);
	// const [blockList, SetBlockList] = useState<any[]>([]);
	// const [requestedList, SetRequestedList] = useState<any[]>([]);
	const [searchList, SetsearchList] = useState<any[]>([]);
	// const [historyList, SetHistoryList] = useState<any[]>([]);
	//const [profilePage, setProfilePage] = useState<any>(null);
	//const [profileDisplayed, setProfileDisplayed] = useState<boolean>(false);
	const [searchFriend, SetsearchFriend] = useState<string>();
	const [friendStatus, SetfriendStatus] = useState<string>();


	let requestTab: any[] = [];
	let friendTab: any[] = [];
	let requestedTab: any[] = [];
	let statusTab: typeof useState[];
	const [User, setUser] = useState<any>();

	// useEffect(() => { // Connect to the socket
	// 	const newSocket = io('http://90.66.192.148:7003');
	// 	if (props?.setSocket)
	// 		props?.setSocket(newSocket);
	// }, []);

	// useEffect(() => {
	// 	if (props?.socket) {
	// 		props?.socket.removeAllListeners();
	// 		props?.socket.on("stpUneNotifstpUneNotif", (data: any) => {
	// 			createNotification("info", "test");
	// 		});
	// 		props?.socket.on("newFriend", (data: any) => {
	// 			if (data.uuid === User.uuid && data?.username) {
	// 				createNotification("info", "New friend request from: " + data.username);
	// 				axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
	// 				headers: ({
	// 					Authorization: 'Bearer ' + localStorage.getItem('token'),
	// 				})
	// 				}).then((res) => {
	// 					requestTab = res.data.usernameList;
	// 					if (requestTab.length)
	// 						props?.SetRequestList(requestTab);
	// 					else
	// 						props?.SetRequestList([]);
	// 				}).catch((err) => {
	// 					console.log(err.message);
	// 					// SetRequestList([]);
	// 				});
	// 			}
	// 		});
	// 		props?.socket.on("friendAccepted", (data: any) => {
	// 			if (data.uuid === User.uuid && data?.username && data?.friendUuid) {
	// 				createNotification("info", data.username + " accepted your friend request");
	// 				axios.get(`http://90.66.192.148:7000/user/ListFriends`, {
	// 				headers: ({
	// 					Authorization: 'Bearer ' + localStorage.getItem('token'),
	// 				})
	// 				}).then((res) => {
	// 					const requested = props?.requestedList.filter((e : any) => e.uuid !== data.friendUuid);
	// 					props?.SetRequestedList(requested);
	// 					friendTab = res.data.friendList;
	// 					props?.SetFriendList(friendTab);
	// 				}).catch((err) => {
	// 					console.log(err.message);
	// 				});
	// 			}
	// 		});
	// 		props?.socket.on("removedOrBlocked", (data: any) => {
	// 			if (data.uuid === User.uuid && data?.username) {
	// 				//createNotification("info", data.username + " accepted your friend request");
	// 				axios.get(`http://90.66.192.148:7000/user/ListFriends`, {
	// 				headers: ({
	// 					Authorization: 'Bearer ' + localStorage.getItem('token'),
	// 				})
	// 				}).then((res) => {
	// 					friendTab = res.data.friendList;
	// 					props?.SetFriendList(friendTab);
	// 				}).catch((err) => {
	// 					console.log(err.message);
	// 				});
	// 			}
	// 		});
	// 		props?.socket.on("CancelFriend", (data: any) => {
	// 			if (data.uuid === User.uuid) {
	// 				axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
	// 				headers: ({
	// 					Authorization: 'Bearer ' + localStorage.getItem('token'),
	// 				})
	// 				}).then((res) => {
	// 					requestTab = res.data.usernameList;
	// 					if (requestTab.length)
	// 						props?.SetRequestList(requestTab);
	// 					else
	// 						props?.SetRequestList([]);
	// 				}).catch((err) => {
	// 					console.log(err.message);
	// 					//SetRequestList([]);
	// 				});
	// 			}
	// 		});
	// 		props?.socket.on("DeclineFriend", (data: any) => {
	// 			if (data.uuid === User.uuid) {
	// 				axios.get(`http://90.66.192.148:7000/user/ListFriendRequested`, {
	// 				headers: ({
	// 					Authorization: 'Bearer ' + localStorage.getItem('token'),
	// 				})
	// 				}).then((res) => {
	// 					requestedTab = res.data.ListFriendsRequested;
	// 					if (requestedTab.length)
	// 						props?.SetRequestedList(requestedTab);
	// 					else
	// 						props?.SetRequestedList([]);
	// 				}).catch((err) => {
	// 					console.log(err.message);
	// 					//SetRequestList([]);
	// 				});
	// 			}
	// 		});
	// 	}
	// }, [props?.socket, User]);

	async function GetLoggedInfoAndUser() {
		if (localStorage.getItem('token')) {
			await axios.get(`http://90.66.192.148:7000/user/getLoggedInfo`, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {

				// setLogged(res.data.IsLoggedIn);
				// setActivated(res.data.isTwoFactorAuthenticationEnabled);
				// setConnected(res.data.isSecondFactorAuthenticated);
			}).catch((err) => {
				console.log(err.message);
				setUser(undefined);
			});
			await axios.get(`http://90.66.192.148:7000/user`, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				setUser(res.data.User);
			}).catch((err) => {
				console.log(err.message);
				setUser(undefined);
				createNotification('error', 'User not found');
				navigate("/");
			});
			await axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				requestTab = res.data.usernameList;
				props?.SetRequestList(requestTab);
				if (requestTab.length) {
					setFriendRequest(requestTab.length);
					//createNotification('success', "You have a new friend request");
				}
				else
					setFriendRequest(undefined);
			}).catch((err) => {
				console.log(err.message);
				setFriendRequest(undefined);
			});
		}
		else
		{
			createNotification('error', 'User not found');
			navigate("/");
		}
		setbooleffect3(false);
	}

	async function ListFriends() {
		await axios.get(`http://90.66.192.148:7000/user/ListFriends`, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				props?.SetFriendList(res.data.friendList);
			}).catch((err) => {
				console.log(err.message);
			});
	}

	async function ListRequested() {
		await axios.get(`http://90.66.192.148:7000/user/ListFriendRequested`, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				props?.SetRequestedList(res.data.ListFriendsRequested);
			}).catch((err) => {
				console.log(err.message);
			});
	}

	async function ListBlocked() {
		await axios.get(`http://90.66.192.148:7000/user/ListUsersBlocked`, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				props?.SetBlockList(res.data.ListUsersblocked);
			}).catch((err) => {
				console.log(err.message);
			});
	}

	async function RemoveFriend(uuid : string) {
		await axios.post(`http://90.66.192.148:7000/user/RemoveFriend`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				const users : any[] = props?.friendList.filter((element : any) => element.uuid !== uuid);
				props?.SetFriendList(users);
				socketSocial.emit('removeOrBlock', {uuid : uuid, myUUID : User.uuid})
			}).catch((err) => {
				console.log(err.response.data.message);
			});
	}


	async function SearchFriend(username : string) {
		await axios.get(`http://90.66.192.148:7000/user/SearchFriend/` + username, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				if (res && res.data)
					SetsearchList(res.data.searchResult)
				else
					SetsearchList([]);
			}).catch((err) => {
				console.log(err.response.data.message);
			});
	}


	async function ShowProfile(uuid : string)
	{
		await axios.get(`http://90.66.192.148:7000/api/room/getGameOfUser/` + uuid, {
		headers: ({
			Authorization: 'Bearer ' + token,
		})
		}).then((res) => {
			if (res.data && res.data.length)
				props?.SetHistoryList(res.data)
			else if (res.data)
				props?.SetHistoryList([]);
		});
		await axios.get(`http://90.66.192.148:7000/user/findUser/` + uuid, {
		headers: ({
			Authorization: 'Bearer ' + token,
		})
		}).then((res) => {
			if (res && res.data)
			{
				// if (location.pathname[location.pathname.length - 1] == '/')
				// 	navigate(location.pathname + uuid);
				// else
				// 	navigate(location.pathname + '/' + uuid);
				props?.setProfilePage(res.data.User);
				props?.setProfileDisplayed(true);
				let blur = document.getElementsByClassName('blur');
				for (let i = 0; i < blur.length ; i++)
					blur[i]?.classList.toggle('active');
				let popup = document.getElementsByClassName('popup');
				for (let i = 0; i < popup.length ; i++)
					popup[i]?.classList.toggle('active');
			}
			else
				props?.setProfilePage([]);
			props?.setbooleffect3(false);
		}).catch((err) => {
			console.log(err);
			navigate(location.pathname);
		});
	}

	async function ShowProfileUseEffect(uuid : string)
	{
		await axios.get(`http://90.66.192.148:7000/api/room/getGameOfUser/` + uuid, {
		headers: ({
			Authorization: 'Bearer ' + token,
		})
		}).then((res) => {
			if (res.data && res.data.length)
				props?.SetHistoryList(res.data)
			else if (res.data)
				props?.SetHistoryList([]);
		});
		await axios.get(`http://90.66.192.148:7000/user/findUser/` + uuid, {
		headers: ({
			Authorization: 'Bearer ' + token,
		})
		}).then((res) => {
			if (res && res.data)
			{
				props?.setProfilePage(res.data.User);
				props?.setProfileDisplayed(true);
				let blur = document.getElementsByClassName('blur');
				for (let i = 0; i < blur.length ; i++)
					blur[i]?.classList.toggle('active');
				let popup = document.getElementsByClassName('popup');
				for (let i = 0; i < popup.length ; i++)
					popup[i]?.classList.toggle('active');
			}
			else
				props?.setProfilePage([]);
		}).catch((err) => {
			console.log(err);
			navigate('/social');
		});
	}

	// async function HideProfile()
	// {
	// 	navigate('/social');
	// 	setProfileDisplayed(false);
	// 	let blur = document.getElementById('blur');
	// 	blur?.classList.toggle('active');
	// 	let popup = document.getElementById('popup');
	// 	popup?.classList.toggle('active');
	// }

	async function HideProfileUseEffect()
	{
		props?.setProfileDisplayed(false);
		let blur = document.getElementsByClassName('blur');
		for (let i = 0; i < blur.length ; i++)
			blur[i]?.classList.toggle('active');
		let popup = document.getElementsByClassName('popup');
		for (let i = 0; i < popup.length ; i++)
			popup[i]?.classList.toggle('active');
	}

	// function IsFriend(uuid : string) {
	// 	const userFriends : any[] = friendList;
	// 	const test : any[] = userFriends.filter(friend => friend.uuid === uuid);
	// 	if (!test.length)
	// 		return true;
	// 	return false;
	// }

	// function IsRequested(uuid : string) {
	// 	const userRequested : any[] = requestedList;
	// 	const test : any[] = userRequested.filter(requested => requested.uuid === uuid);
	// 	if (!test.length)
	// 		return true;
	// 	return false;
	// }

	// function IsRequest(uuid : string) {
	// 	const userRequest : any[] = requestList;
	// 	const request : any[] = userRequest.filter(request => request.uuid === uuid);
	// 	if (!request.length)
	// 		return true;
	// 	return false;
	// }

	// function IsBlocked(uuid : string) {
	// 	const userBlocked : any[] = blockList;
	// 	const test : any[] = userBlocked.filter(blocked => blocked.uuid === uuid);
	// 	if (!test.length)
	// 		return true;
	// 	return false;
	// }

	useEffect(() => {
		if (!booleffect.current) {
			GetLoggedInfoAndUser();
				ListFriends();
				ListBlocked()
				ListRequested();
			booleffect.current = true;
		}
	},);

	useEffect(() => {

		if (!booleffect2.current) {
			// if (((location.pathname === '/social') || (location.pathname === '/social/')) && profileDisplayed)
			// 	HideProfileUseEffect();
			// else if (!(location.pathname === '/social') && !(location.pathname === '/social/') && !profileDisplayed)
			// 	ShowProfileUseEffect(location.pathname.slice(8));
			// console.log(location.pathname)
			// console.log(!profileDisplayed)
			booleffect2.current = true;
		}
	}, [location.pathname]);

	return (
		<div className='SocialPage'>
		{
			<>
			{/* <button onClick={() => {socketSocial.emit("stpUneNotif")}}>Ask notifcation</button> */}
			{
				!(booleffect3) ?
				(
					// <div>
					<>
					<div className="container blur">
						<div>
							<div id='listSearchParent'>
								<h3> Search Friends </h3>
								<form >
									<input
									type="text"
									id="friendusername"
									name="friendusername"	
									required
									maxLength={16}
									onChange={e  => SearchFriend(e.target.value)}
									/>
								</form>
								<div className='box'>
								{
									searchList.length ?
									(
										searchList.length > 3 ?
										(
											<div id='listSearchScroll'>
											{
												searchList.map((user, index) => (
												<div key={user.uuid} className='mapSearch'> 
													<img className="icon" src={user?.image} alt="user_img" width="36" height="27"/>
													<p> {user.username} </p>
													<div className='buttons'>
														<button onClick={(e) => (ShowProfile(user.uuid))} > <FaUserCircle/> </button>
														<button onClick={() => (BlockOrUnblockUser(user.uuid, props?.blockList, socket, User, props?.friendList, props?.SetFriendList, props?.requestList, props?.SetRequestList, props?.requestedList, props?.SetRequestedList, props?.SetBlockList))} > {IsBlocked(user.uuid, props?.blockList) ? <MdBlock/>: <CgUnblock/>} </button>
													</div>
													<div>
													{	IsRequested(user.uuid, props?.requestedList) ?
														(
															IsRequest(user.uuid, props?.requestList) ?
															(
																<div className='buttons2'>
																	<button onClick={() => (AddOrRemoveFriend(user.uuid, props?.friendList, props?.SetRequestedList, props?.requestedList, socket, User, props?.SetFriendList))} > {IsFriend(user.uuid, props?.friendList) ? <IoPersonAddSharp/> : <IoPersonRemoveSharp/>} </button>
																</div>
															)

															:

															(
																<div className='buttons2'>
																	<button onClick={() => (AcceptFriend(user.uuid, user.image, props?.requestList, props?.SetRequestList, props?.SetFriendList, props?.friendList, socket, User))} > <span className='green'> <ImCheckmark/>  </span></button>
																	<button onClick={(e) => (DeclineFriendAdd(user.uuid, props?.requestList, props?.SetRequestList, socket, User))} ><span className='red'><ImCross/></span> </button>
																</div>
															)
									
														)
														:
														<div className='buttons2'>
															<button onClick={(e) => (CancelFriendAdd(user.uuid, props?.requestedList, props?.SetRequestedList, socket, User))} > <MdCancelScheduleSend/> </button>
														</div>
													}
													</div>
												</div>))
											}
											</div>
										)

										:

										(
											<div id='listSearch'>
											{
												searchList.map((user, index) => (
												<div key={user.uuid} className='mapSearch'> 
													<img className="icon" src={user?.image} alt="user_img" width="36" height="27"/>
													<p> {user.username} </p>
													<div className='buttons'>
														<button onClick={(e) => (ShowProfile(user.uuid))} > <FaUserCircle/> </button>
														<button onClick={() => (BlockOrUnblockUser(user.uuid, props?.blockList, socket, User, props?.friendList, props?.SetFriendList, props?.requestList, props?.SetRequestList, props?.requestedList, props?.SetRequestedList, props?.SetBlockList))} > {IsBlocked(user.uuid, props?.blockList) ? <MdBlock/>: <CgUnblock/>} </button>
													</div>
													<div>
													{	IsRequested(user.uuid, props?.requestedList) ?
														(
															IsRequest(user.uuid, props?.requestList) ?
															(
																<div className='buttons2'>
																	<button onClick={() => (AddOrRemoveFriend(user.uuid, props?.friendList, props?.SetRequestedList, props?.requestedList, socket, User, props?.SetFriendList))} > {IsFriend(user.uuid, props?.friendList) ? <IoPersonAddSharp/> : <IoPersonRemoveSharp/>} </button>
																</div>
															)

															:

															(
																<div className='buttons2'>
																	<button onClick={() => (AcceptFriend(user.uuid, user.image, props?.requestList, props?.SetRequestList, props?.SetFriendList, props?.friendList, socket, User))} > <span className='green'><ImCheckmark/></span> </button>
																	<button onClick={(e) => (DeclineFriendAdd(user.uuid, props?.requestList, props?.SetRequestList, socket, User))} > <span className='red'><ImCross/></span> </button>
																</div>
															)
									
														)
														:
														<div className='buttons2'>
															<button onClick={(e) => (CancelFriendAdd(user.uuid, props?.requestedList, props?.SetRequestedList, socket, User))} > <MdCancelScheduleSend/> </button>
														</div>	
													}
													</div>
												</div>))
											}
											</div>
										)
									)

									:

										null
								}
								</div>
							</div>
						</div>
						<div id='listFriendParent'>
							<div>
							<h3> Friend List </h3>
							<div className='box'>
							{
								props?.friendList.length ?
								(
									props?.friendList.length > 3 ?
									(
										<div id='listFriendScroll'>
										{
											props?.friendList.map((user : any) => (
												<div key={user.uuid} className='mapFriend'> 
													<img className="icon" src={user?.image} alt="user_img" width="36" height="27"/>
													<p> {user.username} </p>
													<div className='buttons'>
														<button onClick={(e) => (RemoveFriend(user.uuid))} > <IoPersonRemoveSharp/> </button>
														<button onClick={(e) => (ShowProfile(user.uuid))} > <FaUserCircle/> </button>
														<button onClick={(e) => (BlockOrUnblockUser(user.uuid, props?.blockList, socket, User, props?.friendList, props?.SetFriendList, props?.requestList, props?.SetRequestList, props?.requestedList, props?.SetRequestedList, props?.SetBlockList))}><MdBlock/></button>
													</div>
												</div>
											))
										}
										</div>
									)

									:
									
									(
										<div id='listFriend'>
										{
											props?.friendList.map((user : any) => (
												<div key={user.uuid} className='mapFriend'> 
													<img className="icon" src={user?.image} alt="user_img" width="36" height="27"/>
													<p> {user.username} </p>
													<div className='buttons'>
														<button onClick={(e) => (RemoveFriend(user.uuid))} > <IoPersonRemoveSharp/> </button>
														<button onClick={(e) => (ShowProfile(user.uuid))} > <FaUserCircle/> </button>
														<button onClick={(e) => (BlockOrUnblockUser(user.uuid, props?.blockList, socket, User, props?.friendList, props?.SetFriendList, props?.requestList, props?.SetRequestList, props?.requestedList, props?.SetRequestedList, props?.SetBlockList))}> <MdBlock/> </button>
													</div>
												</div>
											))
										}
										</div>
									)

								)

								:

									null
							}
							</div>
							</div>
						</div>
						
						<div id='listReqParent'>
						{
							<div>
								<h3> Friend requests </h3>		
								<div className='box'>
								{								
									props?.requestList.length ?
									(
										props?.requestList.length > 3 ?
										(
											<div id='listReqScroll'>
											{
												props?.requestList.map((user : any, index : number) => (
												<div key={index} className='mapReq'> 
													<img className="icon" src={user?.image} alt="user_img" width="36" height="27"/>
													<p> {user?.username} </p>
													<div className='buttons'>
														<button onClick={(e) => (ShowProfile(user.uuid))} > <FaUserCircle/> </button>
														<button onClick={(e) => BlockOrUnblockUser(user.uuid, props?.blockList, socket, User, props?.friendList, props?.SetFriendList, props?.requestList, props?.SetRequestList, props?.requestedList, props?.SetRequestedList, props?.SetBlockList)}> <MdBlock/> </button>
														<button onClick={(e) => (AcceptFriend(user.uuid, user.image, props?.requestList, props?.SetRequestList, props?.SetFriendList, props?.friendList, socket, User))} > <span className='green'><ImCheckmark/></span> </button>
														<button onClick={(e) => (DeclineFriendAdd(user.uuid, props?.requestList, props?.SetRequestList, socket, User))} > <span className='red'><ImCross/></span> </button>
													</div>
												</div>))
											}
											</div>
										)
										:
										(
											<div id='listReq'>
											{
												props?.requestList.map((user : any, index : number) => (
												<div key={index} className='mapReq'> 
													<img className="icon" src={user?.image} alt="user_img" width="36" height="27"/>
													<p> {user?.username} </p>
													<div className='buttons'>
														<button onClick={(e) => (ShowProfile(user.uuid))} > <FaUserCircle/> </button>
														<button onClick={(e) => BlockOrUnblockUser(user.uuid, props?.blockList, socket, User, props?.friendList, props?.SetFriendList, props?.requestList, props?.SetRequestList, props?.requestedList, props?.SetRequestedList, props?.SetBlockList)}> <MdBlock/> </button>
														<button onClick={(e) => (AcceptFriend(user.uuid, user.image, props?.requestList, props?.SetRequestList, props?.SetFriendList, props?.friendList, socket, User))} > <span className='green'><ImCheckmark/></span> </button>
														<button onClick={(e) => (DeclineFriendAdd(user.uuid, props?.requestList, props?.SetRequestList, socket, User))} > <span className='red'><ImCross/></span> </button>
													</div>
												</div>))
											}
											</div>
										)
									)

									:

									null							
								}
								</div>
							</div>
						}
						</div>
					</div>
					{/* </div> */}
					</>
					
				)

				:
					null
				}
			</>
		}
		</div>
	)
}

export default Social;