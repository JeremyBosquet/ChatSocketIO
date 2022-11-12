import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useNavigation, } from "react-router-dom"
import { createNotification } from '../../Components/notif/Notif';
import io, { Socket } from 'socket.io-client';
import { Link, useLocation } from 'react-router-dom';
import { whoWon } from '../../Components/Utils/whoWon';
import React from 'react';
//const style = require('./Social.scss');
import './Social.scss';
import NavBar from '../../Components/Nav/NavBar';
import {IoPersonRemoveSharp, IoPersonAddSharp, IoSearchSharp} from 'react-icons/io5';
import { FaUserCircle, FaUserFriends } from "react-icons/fa";
import {ImBlocked, ImCross, ImCheckmark} from "react-icons/im";
import {MdCancelScheduleSend} from "react-icons/md";


function Social() {
	let navigate = useNavigate();
	let location = useLocation();
	const booleffect = useRef<boolean>(false);
	const booleffect2 = useRef<boolean>(false);
	const [booleffect3, setbooleffect3] = useState<boolean>(true);
	const token = localStorage.getItem('token');
	let boolFriendOrNot : boolean = false;

	const [friendRequest, setFriendRequest] = useState<number>();
	const [requestList, SetRequestList] = useState<any[]>([]);
	const firstrender = useRef<boolean>(true);
	const [socket, setSocket] = useState<Socket>();
	const [friendList, SetFriendList] = useState<any[]>([]);
	const [blockList, SetBlockList] = useState<any[]>([]);
	const [requestedList, SetRequestedList] = useState<any[]>([]);
	const [searchList, SetsearchList] = useState<any[]>([]);
	const [historyList, SetHistoryList] = useState<any[]>([]);
	const [profilePage, setProfilePage] = useState<any>(null);
	const [profileDisplayed, setProfileDisplayed] = useState<boolean>(false);
	const [searchFriend, SetsearchFriend] = useState<string>();
	const [friendStatus, SetfriendStatus] = useState<string>();


	let requestTab: any[] = [];
	let friendTab: any[] = [];
	let requestedTab: any[] = [];
	let statusTab: typeof useState[];
	const [User, setUser] = useState<any>();

	useEffect(() => { // Connect to the socket
		const newSocket = io('http://90.66.192.148:7003');
		setSocket(newSocket);
	}, []);

	useEffect(() => {
		if (socket) {
			socket.removeAllListeners();
			socket.on("stpUneNotifstpUneNotif", (data: any) => {
				createNotification("info", "test");
			});
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
				SetRequestList(requestTab);
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
				SetFriendList(res.data.friendList);
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
				SetRequestedList(res.data.ListFriendsRequested);
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
				SetBlockList(res.data.ListUsersblocked);
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
				const users : any[] = friendList.filter(element => element.uuid !== uuid);
				SetFriendList(users);
				socket?.emit('removeOrBlock', {uuid : uuid, myUUID : User.uuid})
			}).catch((err) => {
				console.log(err.response.data.message);
			});
	}

	async function BlockOrUnblockUser(uuid : string) {
		const userBlocked : any[] = blockList;
		const test : any[] = userBlocked.filter(blocked => blocked.uuid === uuid)
		if (!test.length)
		{
			await axios.post(`http://90.66.192.148:7000/user/BlockUser`, {uuid : uuid}, {
					headers: ({
						Authorization: 'Bearer ' + token,
					})
				}).then((res) => {
					const users : any[] = friendList.filter(element => element.uuid !== uuid);
					const request : any[] = requestList.filter(element => element.uuid !== uuid);
					const requested : any[] = requestedList.filter(element => element.uuid !== uuid);
					SetFriendList(users);
					SetBlockList([...blockList,{uuid : uuid}])
					SetRequestList(request);
					SetRequestedList(requested);
					socket?.emit('removeOrBlock', {uuid : uuid, myUUID : User.uuid})
					socket?.emit('CancelFriendAdd', {uuid : uuid, myUUID : User.uuid});
					socket?.emit('DeclineFriendAdd', {uuid : uuid, myUUID : User.uuid});
				}).catch((err) => {
					console.log(err.response.data.message);
				});
		}
		else
		{
			await axios.post(`http://90.66.192.148:7000/user/UnblockUser`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				const users : any[] = friendList.filter(element => element.uuid !== uuid);
				SetFriendList(users);
				SetBlockList(blockList.filter(user => user.uuid !== uuid));
			}).catch((err) => {
				console.log(err.response.data.message);
			});
		}
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

	async function AddOrRemoveFriend(uuid : string) {
		const userFriends : any[] = friendList;
		const test : any[] = userFriends.filter(friend => friend.uuid === uuid)
		if (!test.length)
		{
			await axios.post(`http://90.66.192.148:7000/user/AddFriend`, {uuid : uuid}, {
					headers: ({
						Authorization: 'Bearer ' + token,
					})
				}).then((res) => {
					SetRequestedList([...requestedList, {uuid : uuid}])
					socket?.emit('addFriend', {uuid : uuid, myUUID : User.uuid})
				}).catch((err) => {
					console.log(err.response.data.message);
				});
		}
		else
		{
			await axios.post(`http://90.66.192.148:7000/user/RemoveFriend`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				const users : any[] = friendList.filter(element => element.uuid !== uuid);
				SetFriendList(users);
				socket?.emit('removeOrBlock', {uuid : uuid, myUUID : User.uuid})
			}).catch((err) => {
				console.log(err.response.data.message);
			});
		}
	}

	async function AcceptFriend(uuid : string, image : any) {
		const test : any[] = requestList.filter(friend => friend.uuid === uuid)
		if (test.length)
		{
			await axios.post(`http://90.66.192.148:7000/user/AcceptFriend`, {uuid : uuid}, {
					headers: ({
						Authorization: 'Bearer ' + token,
					})
				}).then((res) => {
					const request : any[] = requestList.filter(element => element.uuid !== uuid);
					SetFriendList([...friendList, {uuid : uuid , username : test[0].username, image : image}]);
					SetRequestList(request);
					socket?.emit('acceptFriend', {uuid : uuid, myUUID : User.uuid});
				}).catch((err) => {
					console.log(err.response.data.message);
				});
		}
	}

	async function DeclineFriendAdd(uuid : string) {
		const test : any[] = requestList.filter(friend => friend.uuid === uuid)
		if (test.length)
		{
			await axios.post(`http://90.66.192.148:7000/user/DeclineFriendAdd`, {uuid : uuid}, {
					headers: ({
						Authorization: 'Bearer ' + token,
					})
				}).then((res) => {
					const request : any[] = requestList.filter(element => element.uuid !== uuid);
					SetRequestList(request);
					socket?.emit('DeclineFriendAdd', {uuid : uuid, myUUID : User.uuid});
				}).catch((err) => {
					console.log(err.response.data.message);
				});
		}
	}

	async function CancelFriendAdd(uuid : string) {
		const test : any[] = requestedList.filter(friend => friend.uuid === uuid)
		if (test.length)
		{
			await axios.post(`http://90.66.192.148:7000/user/CancelFriendAdd`, {uuid : uuid}, {
					headers: ({
						Authorization: 'Bearer ' + token,
					})
				}).then((res) => {
					const requested : any[] = requestedList.filter(element => element.uuid !== uuid);
					SetRequestedList(requested);
					socket?.emit('CancelFriendAdd', {uuid : uuid, myUUID : User.uuid});
				}).catch((err) => {
					console.log(err.response.data.message);
				});
		}
	}

	async function ShowProfile(uuid : string)
	{
		await axios.get(`http://90.66.192.148:7000/api/room/getGameOfUser/` + uuid, {
		headers: ({
			Authorization: 'Bearer ' + token,
		})
		}).then((res) => {
			if (res.data && res.data.length)
				SetHistoryList(res.data)
			else if (res.data)
				SetHistoryList([]);
		});
		await axios.get(`http://90.66.192.148:7000/user/findUser/` + uuid, {
		headers: ({
			Authorization: 'Bearer ' + token,
		})
		}).then((res) => {
			if (res && res.data)
			{
				navigate('/social/' + uuid);
				setProfilePage(res.data.User);
				setProfileDisplayed(true);
				let blur = document.getElementById('blur');
				blur?.classList.toggle('active');
				let popup = document.getElementById('popup');
				popup?.classList.toggle('active');
			}
			else
				setProfilePage([]);
		}).catch((err) => {
			console.log(err.response.data.message);
			navigate('/social');
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
				SetHistoryList(res.data)
			else if (res.data)
				SetHistoryList([]);
		});
		await axios.get(`http://90.66.192.148:7000/user/findUser/` + uuid, {
		headers: ({
			Authorization: 'Bearer ' + token,
		})
		}).then((res) => {
			if (res && res.data)
			{
				setProfilePage(res.data.User);
				setProfileDisplayed(true);
				let blur = document.getElementById('blur');
				blur?.classList.toggle('active');
				let popup = document.getElementById('popup');
				popup?.classList.toggle('active');
			}
			else
				setProfilePage([]);
		}).catch((err) => {
			console.log(err.response.data.message);
			navigate('/social');
		});
	}

	async function HideProfile()
	{
		navigate('/social');
		setProfileDisplayed(false);
		let blur = document.getElementById('blur');
		blur?.classList.toggle('active');
		let popup = document.getElementById('popup');
		popup?.classList.toggle('active');
	}

	async function HideProfileUseEffect()
	{
		setProfileDisplayed(false);
		let blur = document.getElementById('blur');
		blur?.classList.toggle('active');
		let popup = document.getElementById('popup');
		popup?.classList.toggle('active');
	}

	function IsFriend(uuid : string) {
		const userFriends : any[] = friendList;
		const test : any[] = userFriends.filter(friend => friend.uuid === uuid);
		if (!test.length)
			return true;
		return false;
	}

	function IsRequested(uuid : string) {
		const userRequested : any[] = requestedList;
		const test : any[] = userRequested.filter(requested => requested.uuid === uuid);
		if (!test.length)
			return true;
		return false;
	}

	function IsRequest(uuid : string) {
		const userRequest : any[] = requestList;
		const request : any[] = userRequest.filter(request => request.uuid === uuid);
		if (!request.length)
			return true;
		return false;
	}

	function IsBlocked(uuid : string) {
		const userBlocked : any[] = blockList;
		const test : any[] = userBlocked.filter(blocked => blocked.uuid === uuid);
		if (!test.length)
			return true;
		return false;
	}

	// 	for (let i = 0; i < users.length; i++)
	// 	{
	// 		await axios.get(`http://90.66.192.148:7000/user/IsFriend/` + users[i].uuid, {
	// 				headers: ({
	// 					Authorization: 'Bearer ' + token,
	// 				})
	// 			}).then((res) => {
	// 				console.log(res)
	// 				if (res && res.data && res.data.IsFriend)
	// 					boolFriendOrNot = true;
	// 				else
	// 					boolFriendOrNot =false;
	// 			}).catch((err) => {
	// 				console.log(err.response.data.message);
	// 				boolFriendOrNot =false;
	// 			});
	// 	}
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
			<div>
			{/* <button onClick={() => {socket?.emit("stpUneNotif")}}>Ask notifcation</button> */}
			{
				!(booleffect3) ?
				(
					<div>
					<div className='container' id='blur'>
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
									<p><IoSearchSharp/></p>
								</form>
								<div>
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
														<button onClick={() => (BlockOrUnblockUser(user.uuid))} > {IsBlocked(user.uuid) ? <ImBlocked/>: "Unblock"} </button>
													</div>
													<div>
													{	IsRequested(user.uuid) ?
														(
															IsRequest(user.uuid) ?
															(
																<div className='buttons2'>
																	<button onClick={() => (AddOrRemoveFriend(user.uuid))} > {IsFriend(user.uuid) ? <IoPersonAddSharp/> : <IoPersonRemoveSharp/>} </button>
																</div>
															)

															:

															(
																<div className='buttons2'>
																	<button onClick={() => (AcceptFriend(user.uuid, user.image))} > <span className='green'> <ImCheckmark/>  </span></button>
																	<button onClick={(e) => (DeclineFriendAdd(user.uuid))} ><span className='red'><ImCross/></span> </button>
																</div>
															)
									
														)
														:
														<div className='buttons2'>
															<button onClick={(e) => (CancelFriendAdd(user.uuid))} > <MdCancelScheduleSend/> </button>
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
														<button onClick={() => (BlockOrUnblockUser(user.uuid))} > {IsBlocked(user.uuid) ? <ImBlocked/>: "Unblock"} </button>
													</div>
													<div>
													{	IsRequested(user.uuid) ?
														(
															IsRequest(user.uuid) ?
															(
																<div className='buttons2'>
																	<button onClick={() => (AddOrRemoveFriend(user.uuid))} > {IsFriend(user.uuid) ? <IoPersonAddSharp/> : <IoPersonRemoveSharp/>} </button>
																</div>
															)

															:

															(
																<div className='buttons2'>
																	<button onClick={() => (AcceptFriend(user.uuid, user.image))} > <span className='green'><ImCheckmark/></span> </button>
																	<button onClick={(e) => (DeclineFriendAdd(user.uuid))} > <span className='red'><ImCross/></span> </button>
																</div>
															)
									
														)
														:
														<div className='buttons2'>
															<button onClick={(e) => (CancelFriendAdd(user.uuid))} > <MdCancelScheduleSend/> </button>
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
							<div>
							{
								friendList.length ?
								(
									friendList.length > 2 ?
									(
										<div id='listFriendScroll'>
										{
											friendList.map((user) => (
												<div key={user.uuid} className='mapFriend'> 
													<img className="icon" src={user?.image} alt="user_img" width="36" height="27"/>
													<p> {user.username} </p>
													<div className='buttons'>
														<button onClick={(e) => (RemoveFriend(user.uuid))} > <IoPersonRemoveSharp/> </button>
														<button onClick={(e) => (ShowProfile(user.uuid))} > <FaUserCircle/> </button>
														<button onClick={(e) => (BlockOrUnblockUser(user.uuid))}><ImBlocked/></button>
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
											friendList.map((user) => (
												<div key={user.uuid} className='mapFriend'> 
													<img className="icon" src={user?.image} alt="user_img" width="36" height="27"/>
													<p> {user.username} </p>
													<div className='buttons'>
														<button onClick={(e) => (RemoveFriend(user.uuid))} > <IoPersonRemoveSharp/> </button>
														<button onClick={(e) => (ShowProfile(user.uuid))} > <FaUserCircle/> </button>
														<button onClick={(e) => (BlockOrUnblockUser(user.uuid))}> <ImBlocked/> </button>
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
								<div>
								{								
									requestList.length ?
									(
										requestList.length > 3 ?
										(
											<div id='listReqScroll'>
											{
												requestList.map((user, index) => (
												<div key={index} className='mapReq'> 
													<img className="icon" src={user?.image} alt="user_img" width="36" height="27"/>
													<p> {user?.username} </p>
													<div className='buttons'>
														<button onClick={(e) => (ShowProfile(user.uuid))} > <FaUserCircle/> </button>
														<button onClick={(e) => BlockOrUnblockUser(user.uuid)}> <ImBlocked/> </button>
														<button onClick={(e) => (AcceptFriend(user.uuid, user.image))} > <span className='green'><ImCheckmark/></span> </button>
														<button onClick={(e) => (DeclineFriendAdd(user.uuid))} > <span className='red'><ImCross/></span> </button>
													</div>
												</div>))
											}
											</div>
										)
										:
										(
											<div id='listReq'>
											{
												requestList.map((user, index) => (
												<div key={index} className='mapReq'> 
													<img className="icon" src={user?.image} alt="user_img" width="36" height="27"/>
													<p> {user?.username} </p>
													<div className='buttons'>
														<button onClick={(e) => (ShowProfile(user.uuid))} > <FaUserCircle/> </button>
														<button onClick={(e) => BlockOrUnblockUser(user.uuid)}> <ImBlocked/> </button>
														<button onClick={(e) => (AcceptFriend(user.uuid, user.image))} > <span className='green'><ImCheckmark/></span> </button>
														<button onClick={(e) => (DeclineFriendAdd(user.uuid))} > <span className='red'><ImCross/></span> </button>
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
				<div id="popup">
				{
					profileDisplayed ?
					(
						<div>
							<h3> {profilePage?.username} </h3>
							<img className="ProfileImg" src={profilePage?.image} alt="user_img" width="384" height="256"/>
							<div>
							{	IsRequested(profilePage?.uuid) ?
								(
									IsRequest(profilePage?.uuid) ?
									(
										<div>
											<button onClick={() => (AddOrRemoveFriend(profilePage?.uuid))} > {IsFriend(profilePage?.uuid) ? <IoPersonAddSharp/> : <IoPersonRemoveSharp/>} </button>
										</div>
									)

									:

									(
										<div>
											<button onClick={() => (AcceptFriend(profilePage?.uuid, profilePage?.image))} > <span className='green'><ImCheckmark/></span> </button>
											<button onClick={(e) => (DeclineFriendAdd(profilePage?.uuid))} > <span className='red'><ImCross/></span> </button>
										</div>
									)
			
								)
								:
									<button onClick={(e) => (CancelFriendAdd(profilePage?.uuid))} > <MdCancelScheduleSend/> </button>	
							}
							</div>
							<button onClick={() => (BlockOrUnblockUser(profilePage?.uuid))} > {IsBlocked(profilePage?.uuid) ? <ImBlocked/>: "Unblock"} </button>
							<button onClick={() =>  HideProfile()}> Close </button>
							<div id='listGameParent'>
							{
								historyList.length ?
								(
									historyList.length > 3 ?
									(
										<div id='listGameScroll'>
										{
											historyList.map((game, index) => (
												<ul key={index} >
													{whoWon(profilePage.uuid, game.playerA, game.playerB, game.status) === 'Victory' ? 
													
														<li> <span className='green'> {game.playerA.name} vs {game.playerB.name} / {whoWon(profilePage.uuid, game.playerA, game.playerB, game.status)}</span> </li>

														:

														<li> <span className='red'> {game.playerA.name} vs {game.playerB.name} / {whoWon(profilePage.uuid, game.playerA, game.playerB, game.status)}</span> </li>
														
													}
													<li> <span className='green'> this is test of history match </span> </li>
													<li> <span className='red'> this is test of history match </span> </li>
													<li> <span className='green'> this is test of history match </span> </li>
													<li> <span className='red'> this is test of history match </span> </li>
													<li> <span className='green'> this is test of history match </span> </li>
												</ul>
											))
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
										}
										</div>
									)
								)

								:

								null
							}
							</div>
							
						</div>
						
					)

					:

					(
						null
					)
				}
				</div>
					</div>
					
				)

				:
					null
				}
			</div>
		}
		</div>
	)
}

export default Social;