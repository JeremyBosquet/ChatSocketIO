import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, } from "react-router-dom"
import { createNotification } from '../Components/notif/Notif';
import io, { Socket } from 'socket.io-client';


function Social() {
	let navigate = useNavigate();
	const booleffect = useRef<boolean>(false);
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
	const [searchFriend, SetsearchFriend] = useState<string>();
	const [friendStatus, SetfriendStatus] = useState<string>();

	
	let requestTab: any[] = [];
	let statusTab: typeof useState[];
	const [User, setUser] = useState<any>();

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
					requestTab = res.data.usernameList;
					if (requestTab.length)
						SetRequestList(requestTab);
					else
						SetRequestList([]);
				}).catch((err) => {
					console.log(err.message);
					// SetRequestList([]);
				});
			});
			socket.on("friendAccepted", (data: any) => {
				if (data.uuid === User.uuid && data?.username) {
					createNotification("info", data.username + " accepted your friend request");
				}
				axios.get(`http://90.66.192.148:7000/user/ListFriends`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
				}).then((res) => {
					requestTab = res.data.friendList;
					// wconsole.log(res.data)
					// if (requestTab.length)
					// 	SetRequestList(requestTab);
					// else
					// 	SetRequestList([]);
					SetFriendList([...friendList, {uuid : data.uuid}])
				}).catch((err) => {
					console.log(err.message);
				});
			});
			socket.on("CancelFriend", (data: any) => {
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
					SetFriendList(users);
					SetBlockList([...blockList,{uuid : uuid}])
					SetRequestList(request);
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
			}).catch((err) => {
				console.log(err.response.data.message);
			});
		}
	}

	async function AcceptFriend(uuid : string) {
		const test : any[] = requestList.filter(friend => friend.uuid === uuid)
		console.log(test[0].username)
		if (test.length)
		{
			await axios.post(`http://90.66.192.148:7000/user/AcceptFriend`, {uuid : uuid}, {
					headers: ({
						Authorization: 'Bearer ' + token,
					})
				}).then((res) => {
					const requested : any[] = requestedList.filter(element => element.uuid !== uuid);
					SetFriendList([...friendList, {uuid : uuid , username : test[0].username}]);
					SetRequestedList(requested);
					socket?.emit('acceptFriend', {uuid : uuid, myUUID : User.uuid});
				}).catch((err) => {
					console.log(err.response.data.message);
				});
		}
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
		const test : any[] = userBlocked.filter(blocked => blocked.uuid === uuid)
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

	return (
		<div>
			<div>
				<h1> Friends List </h1>
				{friendList.map((user) => (
				<div key={user.uuid}> 
					<p> {user.username} </p>
					<button onClick={(e) => (RemoveFriend(user.uuid))} > remove friend </button>
					<button onClick={(e) => (BlockOrUnblockUser(user.uuid))}> Block </button>
				</div>))}
				<br></br>
			</div>
			<div>
				<h1> Search Friends </h1>
				<form >
					<p> Your friend username : &nbsp;
						<input
						type="text"
						id="friendusername"
						name="friendusername"	
						required
						onChange={e  => SearchFriend(e.target.value)}
						/>
					</p>
				</form>
				{searchList.map((user, index) => (
				<div key={user.uuid}> 
					<p> {user.username} </p>
					{	IsRequested(user.uuid) ?
						(
							IsRequest(user.uuid) ?
							(
								<button onClick={() => (AddOrRemoveFriend(user.uuid))} > {IsFriend(user.uuid) ? "Add as friend": "Remove friend"} </button>
							)

							:

							(
								<button onClick={() => (AcceptFriend(user.uuid))} > "Accept Friend" </button>
							)
	
						)
						:
							null	
					}
					
					<button onClick={() => (BlockOrUnblockUser(user.uuid))} > {IsBlocked(user.uuid) ? "Block": "Unblock"} </button>
				</div>))}
				<br></br>
			</div>
			<div>
				<h1> Friend requests </h1>
				{requestList.map((user, index) => (
				<div key={index}> 
					<p> {user.username} </p>
					<button onClick={(e) => (AcceptFriend(user.uuid))} > accept friend </button>
					<button onClick={(e) => BlockOrUnblockUser(user.uuid)}> Block </button>
				</div>))}
				<br></br>
			</div>
		<div>  
		</div>
			<div>
				<button onClick={() => navigate("/")}> Home </button>
			</div>
		</div>
	)
}

export default Social;