import axios from 'axios';
import io, { Socket } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom"
import { createNotification } from '../Components/notif/Notif';
// import { useDispatch, useSelector } from 'react-redux';
// import { getLogged, getUser, setLogged, setUser, getActivated, setActivated, getConnected, setConnected } from '../Redux/authSlice';

function HomePage() {
	let navigate = useNavigate();
	let tab: any[] = [];
	const [compt, setCompt] = useState<number>(0);
	//const [user, setUser] = useState<any>();
	const booleffect = useRef<boolean>(false);
	const firstrender = useRef<boolean>(true);
	const [socket, setSocket] = useState<Socket>();

	// const IsLoggedIn = useSelector(getLogged);
	// const IsTwoAuthConnected = useSelector(getConnected);
	// const IsTwoAuthActivated = useSelector(getActivated);
	// const User = useSelector(getUser);
	// const dispatch = useDispatch();


	const [User, setUser] = useState<any>();
	const [friendRequest, setFriendRequest] = useState<number>();
	// const [IsLoggedIn, setLogged] = useState<boolean>();
	// const [IsTwoAuthActivated, setActivated] = useState<boolean>();
	// const [IsTwoAuthConnected, setConnected] = useState<boolean>();
	useEffect(() => { // Connect to the socket
		const newSocket = io('http://90.66.192.148:7003');
		setSocket(newSocket);
	}, []);

	useEffect(() => {
		if (socket) {
			socket.removeAllListeners();
			socket.on("newFriend", (data: any) => {
				if (data.uuid === User.uuid && data?.username) {
					createNotification("info", "New friend request from: " + data.username);
				}
				axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
				}).then((res) => {
					tab = res.data.ListFriendsRequest;
					if (tab.length) {
						setFriendRequest(tab.length);
						//createNotification('success', "You have a new friend request");
					}
					else
						setFriendRequest(0);
					setCompt(tab.length);
				}).catch((err) => {
					console.log(err.message);
					setFriendRequest(0);
				});
			});
			socket.on("FriendAccepted", (data: any) => {
				if (data.uuid === User.uuid && data?.username) {
					createNotification("info", data.username + " accepted your friend request");
				}
				axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
				}).then((res) => {
					tab = res.data.ListFriendsRequest;
					if (tab.length) {
						setFriendRequest(tab.length);
					}
					else
						setFriendRequest(0);
					setCompt(tab.length);
				}).catch((err) => {
					console.log(err.message);
					setFriendRequest(0);
				});
			});
			socket.on("CancelFriend", (data: any) => {
				axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
				}).then((res) => {
					tab = res.data.ListFriendsRequest;
					if (tab.length) {
						setFriendRequest(tab.length);
						//createNotification('success', "You have a new friend request");
					}
					else
						setFriendRequest(0);
					setCompt(tab.length);
				}).catch((err) => {
					console.log(err.message);
					setFriendRequest(0);
				});
			});
		}
	}, [socket, User]);

	async function GetLoggedInfoAndUser() {
		if (localStorage.getItem('token')) {
			await axios.get(`http://90.66.192.148:7000/user/getLoggedInfo`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
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
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				setUser(res.data.User);
			}).catch((err) => {
				console.log(err.message);
				setUser(undefined);
			});
			await axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				tab = res.data.ListFriendsRequest;
				if (tab.length) {
					setFriendRequest(tab.length);
					//createNotification('success', "You have a new friend request");
				}
				else
					setFriendRequest(0);
				setCompt(tab.length);
			}).catch((err) => {
				console.log(err.message);
				setFriendRequest(0);
			});
		}
	}

	useEffect(() => {
		if (!booleffect.current) {
			GetLoggedInfoAndUser();
			booleffect.current = true;
		}
	}, []);

	/*useEffect(() => {
		if (firstrender.current)
		{
			firstrender.current = false;
			return;
		}
		const interval = setInterval(async () => {
			await axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				tab = res.data.ListFriendsRequest;
				if (tab.length)
				{
					setFriendRequest(tab.length);
					if (tab.length > compt)
					{
						console.log(compt)
						createNotification('success', "You have a new friend request");
					}
				}
				else
					setFriendRequest(0);
				setCompt(tab.length);
			}).catch((err) => {
				console.log(err.message);
				setFriendRequest(0);
			});
		}, 2000);
		return () => clearInterval(interval);
	}, [friendRequest]);
*/
	return (
		<div>
			{
				(User) ?
					(
						<div>
							{
								User === undefined ?
									(
										<div>
											<button onClick={() => navigate("/login")}> login </button>
										</div>
									)

									:
									<div>
										<button onClick={() => navigate("/profile")}> Profile </button>
										<button onClick={() => navigate("/parameters")}> Parameters </button>
										<button onClick={() => navigate("/logout")}> Logout </button>
										<button onClick={() => navigate("/game")}> Game </button>
										<button onClick={() => navigate("/game/spectate")}> Spectate a game </button>
										<div>
											{
												(friendRequest) ?
													(
														<button onClick={() => {
															socket?.disconnect();
															setSocket(undefined);
															navigate("/social")
														}}> Social({compt}) </button>
													)

													:

													<button onClick={() => {
														socket?.disconnect();
														setSocket(undefined);
														navigate("/social")
													}}> Social </button>
											}
										</div>
									</div>
							}
						</div>
					)

					:

					<div>
						<button onClick={() => navigate("/login")}> login </button>
					</div>
			}
		</div>
	)
}

export default HomePage;