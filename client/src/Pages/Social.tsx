import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, } from "react-router-dom"
import { createNotification } from '../Components/notif/Notif';
import io, { Socket } from 'socket.io-client';


function Social() {
	let navigate = useNavigate();
	const booleffect = useRef<boolean>(false);
	const token = localStorage.getItem('token');

	const [friendRequest, setFriendRequest] = useState<number>();
	const [requestList, setRequestList] = useState<any[]>([]);
	const [compt, setCompt] = useState<number>(0);
	const firstrender = useRef<boolean>(true);
	const [socket, setSocket] = useState<Socket>();
	const [friendList, SetFriendList] = useState<any[]>([]);
	
	let requestTab: any[] = [];
	let friendsTab: any[] = [];

	useEffect(() => { // Connect to the socket
		const newSocket = io('http://90.66.192.148:7003');
		setSocket(newSocket);
	}, []);

	const [User, setUser] = useState<any>();
	useEffect(() => {
		if (socket) {
			socket.removeAllListeners();
			socket.on("newFriend", (data: any) => {
				if (data.uuid === User.uuid && data?.username) {
					createNotification("info", "New friend request You have a new friend request : " + data.username);
				}
				axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
				}).then((res) => {
					requestTab = res.data.ListFriendsRequest;
					if (requestTab.length)
						setFriendRequest(requestTab.length);
					else
						setFriendRequest(0);
					setCompt(requestTab.length);
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
					requestTab = res.data.ListFriendsRequest;
					if (requestTab.length) {
						console.log(requestTab.length)
						setFriendRequest(requestTab.length);
						//createNotification('success', "You have a new friend request");
					}
					else
						setFriendRequest(0);
					setCompt(requestTab.length);
				}).catch((err) => {
					console.log(err.message);
					setFriendRequest(0);
				});
			});
		}
	}, [socket, User]);

	async function GetLoggedInfoAndUser() {
		if (token) {
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
			});
			await axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				requestTab = res.data.ListFriendsRequest;
				setRequestList(requestTab);
				if (requestTab.length) {
					setFriendRequest(requestTab.length);
					//createNotification('success', "You have a new friend request");
				}
				else
					setFriendRequest(undefined);
				setCompt(requestTab.length);
			}).catch((err) => {
				console.log(err.message);
				setFriendRequest(undefined);
			});
		}
	}

	async function ListFriends() {
		await axios.get(`http://90.66.192.148:7000/user/ListFriends`, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				//SetFriendList(res.data.friendList);
				friendsTab = res.data.friendList;
				for (let i = 0; i < friendsTab.length; i++)
				{
					axios.get('http://90.66.192.148:7000/user/findUser/' + friendsTab[i].uuid, {
					headers: ({
						Authorization: 'Bearer ' + token,
					})
					}).then((res) => {
						friendsTab[i] = res.data.User;
						console.log(friendsTab[i]);
					}).catch((err) => {
						console.log(err)
						friendsTab.splice(i, 1);
					});
					SetFriendList(friendsTab);
				}
				// if (friendsTab.length) {
				// 	setFriendRequest(requestTab.length);
				// }
				// else
				// 	setFriendRequest(undefined);
			}).catch((err) => {
				console.log(err.message);
				//setFriendRequest(undefined);
			});

	}

	useEffect(() => {
		if (!booleffect.current) {
			GetLoggedInfoAndUser();
			ListFriends();
			booleffect.current = true;
		}
	}, []);

	return (
		<div>
			<div>
				<h1> Friends List </h1>
				{friendList.map((user) => (
				<div key={user.uuid}> 
					<p> {user.username} </p>
					<button> f </button> 
				</div>))}
			</div>
			{/* <div>
				<button onClick={() => {
					socket?.disconnect();
					setSocket(undefined);
					navigate("/")}}> home </button>
				<button onClick={async () => {
					await axios.post(`http://90.66.192.148:7000/user/AddFriend`, {
						"uuid": "ebd2ae56-ffff-47d5-934d-ed5141136f34"
					}, {
						headers: ({
							Authorization: 'Bearer ' + token,
						})
					}).then((res) => {
						console.log("hello");
						socket?.emit('addFriend', { uuid: "ebd2ae56-ffff-47d5-934d-ed5141136f34", myUUID: "4f08d115-1316-44fc-b5e0-edfaeda9a469" });
					}).catch((err) => {
						console.log(err);
					});


				}}>Add this friends</button>
				<button onClick={async () => {
					await axios.post(`http://90.66.192.148:7000/user/CancelFriendAdd`, {
						"uuid": "ebd2ae56-ffff-47d5-934d-ed5141136f34"
					}, {
						headers: ({
							Authorization: 'Bearer ' + token,
						})
					}).then((res) => {
						console.log("hi")
						socket?.emit('CancelFriendAdd', { uuid: "ebd2ae56-ffff-47d5-934d-ed5141136f34", myUUID: "4f08d115-1316-44fc-b5e0-edfaeda9a469" });
					}
					).catch((err) => {
						console.log(err);
					});
				}}>Cancel this friends</button>
			</div>*/}
		<div>  
		</div>
			{
				friendRequest ?
				(
					<div>
						<button onClick={() => navigate("/")}> Friend Request ({compt}) </button>
					</div>
				)

				:
				
				<div>
					<button onClick={() => navigate("/")}> Friend Request </button>
				</div>
			}
		</div>
	)
}

export default Social;