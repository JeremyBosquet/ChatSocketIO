import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import SignIn from "./Components/Auth/Signin";
import GetToken from "./Components/Auth/GetToken";
import HomePage from "./Pages/Home/HomePage";
import NotFound from "./Pages/NotFound/NotFound";
import Logout from "./Components/Auth/Logout";
import Settings from "./Components/Settings/Settings";
import TwoAuth from "./Pages/TwoAuth/TwoAuth";

import GameSpectatePage from "./Pages/GameSpectatePage/GameSpectatePage";
import React from "react";
import { getConnectedList, getRequestedList, getSocketSocial, getUser, setBlockedByList, setConnectedList, setFriendList, setRequestedList, setRequestList, setSocketSocial, setUser, setBlockList, setInGameList } from "./Redux/userSlice";
import { getSocket, setSocket } from "./Redux/chatSlice";
import ChannelPage from "./Pages/ChannelPage/ChannelPage";
import DMPage from "./Pages/DMPage/DMPage";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import Protected from "./Protected";
import { createNotification } from "./Components/notif/Notif";
import Profile from "./Pages/Profile/Profile";
import instance from "./API/Instance";
import ProtectedTwoAuth from "./ProtectedTwoAuth";
import Leaderboard from "./Pages/Leaderboard/Leaderboard";
import Rules from "./Pages/Rules/Rules";

function App() {
	const [APIStatus] = useState<boolean>(true);
	const dispatch = useDispatch();
	const user = useSelector(getUser);
	const socketSocial = useSelector(getSocketSocial);
	const socketChat = useSelector(getSocket);
	const ConnectedList = useSelector(getConnectedList);
	const requestedList = useSelector(getRequestedList);
	const [booleffect, setBooleffect] = useState<boolean>(false);
	let listUsers: any[] = [];

	useEffect(() => {
		if (!socketChat) {
			const newSocket = io(import.meta.env.VITE_URL_API + ':7004');
			dispatch(setSocket(newSocket));
		}
	}, []);

	useEffect(() => {
		if (localStorage.getItem('token')) {
			async function ListFriends() {
				await instance.get(`user/ListFriends`).then((res) => {
					dispatch(setFriendList(res.data.friendList));
				});

				await instance.get(`user/ListBlockedBy`).then((res) => {
					let blockedByList: any[] = res.data.ListBlockedBy;
					if (blockedByList) {
						dispatch(setBlockedByList(blockedByList));
					}
					else
						dispatch(setBlockedByList([]));
				});

				await instance.get(`user/ListBlockedBy`).then((res) => {
					let blockedByList: any[] = res.data.ListBlockedBy;
					if (blockedByList) {
						dispatch(setBlockedByList(blockedByList));
					}
					else
						dispatch(setBlockedByList([]));
				});
			}

			const socketSet = async () => {
				await instance.get(`user`)
					.then((res) => {
						if (res.data.User) {
							socketSocial?.close();
							const newSocketSocial = io(import.meta.env.VITE_URL_API + ':7003');
							dispatch(setSocketSocial(newSocketSocial));
							dispatch(setUser(res.data.User));
							ListFriends();
						}
					});
			}
			socketSet();
		}
	}, []);

	useEffect(() => {
		if (user && user.uuid) {
			socketSocial?.emit("connected", { uuid: user.uuid });
		}
		else if (user)
		{
			socketSocial?.close();
			const newSocketSocial = io(import.meta.env.VITE_URL_API + ':7003');
			newSocketSocial?.emit("connected", { uuid: user.uuid });
			dispatch(setSocketSocial(newSocketSocial));
		}
	}, [user]);

	socketSocial?.removeListener("newFriend");
	socketSocial?.on("newFriend", (data: any) => {
		if (user && data.uuid === user.uuid && data?.username) {
			createNotification("info", "New friend request from: " + data.username);
			instance.get(`user/ListFriendRequest`).then((res) => {
				let requestTab = res.data.usernameList;
				if (requestTab)
					dispatch(setRequestList(requestTab));
				else
					dispatch(setRequestList([]));
			});
		}
	});
	socketSocial?.removeListener("friendAccepted");
	socketSocial?.on("friendAccepted", (data: any) => {
		if (user && data.uuid === user.uuid && data?.username && data?.friendUuid) {
			createNotification("info", data.username + " accepted your friend request");
			instance.get(`user/ListFriends`).then((res) => {
				const requested = requestedList.filter((e: any) => e.uuid !== data.friendUuid);
				dispatch(setRequestedList(requested));
				let friendList = res.data.friendList;
				if (friendList)
					dispatch(setFriendList(friendList));
			});
		}
	});
	socketSocial?.removeListener("removedOrBlocked");
	socketSocial?.on("removedOrBlocked", (data: any) => {
		if (user && data.uuid === user.uuid && data?.username) {
			instance.get(`user/ListFriends`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				let friendList = res.data.friendList;
				if (friendList)
					dispatch(setFriendList(res.data.friendList));
			});
		}
	});
	socketSocial?.removeListener("Unblocked");
	socketSocial?.on("Unblocked", (data: any) => {
		if (user && data.uuid === user.uuid && data?.username) {
			instance.get(`user/ListBlockedBy`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				let blockedByList: any[] = res.data.ListBlockedBy;
				if (blockedByList) {
					dispatch(setBlockedByList(blockedByList));
					return;
				}
			});
			dispatch(setBlockedByList([]));
		}
	});
	socketSocial?.removeListener("Block");
	socketSocial?.on("Block", (data: any) => {
		if (user && data.uuid === user.uuid && data?.username) {
			instance.get(`user/ListBlockedBy`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				let blockedByList: any[] = res.data.ListBlockedBy;
				if (blockedByList) {
					dispatch(setBlockedByList(blockedByList));
					return;
				}
			});
			dispatch(setBlockedByList([]));
		}
	});
	socketSocial?.removeListener("CancelFriend");
	socketSocial?.on("CancelFriend", (data: any) => {
		if (user && data.uuid === user.uuid) {
			instance.get(`user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				let requestTab = res.data.usernameList;
				if (requestTab)
					dispatch(setRequestList(requestTab));
				else
					dispatch(setRequestList([]));
			});
		}
	});
	socketSocial?.removeListener("DeclineFriend");
	socketSocial?.on("DeclineFriend", (data: any) => {
		if (user && data.uuid === user.uuid) {
			instance.get(`user/ListFriendRequested`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				let requestedTab = res.data.ListFriendsRequested;
				if (requestedTab)
					dispatch(setRequestedList(requestedTab));
				else
					dispatch(setRequestedList([]));
			});
		}
	});

	async function filterBlockedUsers(data: any) {
		if (data.users)
			listUsers = [...data.users];
		if (localStorage.getItem("token"))
		{
			await instance.get(`user/ListUsersBlocked`)
				.then((res) => {
					let blockedList: any[] = res.data.ListUsersblocked;
					if (blockedList) {
						for (let i = 0; i < blockedList.length; i++) {
							listUsers = listUsers.filter((e: any) => e.uuid !== blockedList[i].uuid);
						}
					}
				});
			await instance.get(`user/ListBlockedBy`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			})
				.then((res) => {
					let blockedByList: any[] = res.data.ListBlockedBy;
					if (blockedByList) {
						for (let i = 0; i < blockedByList.length; i++) {
							listUsers = listUsers.filter((e: any) => e.uuid !== blockedByList[i].uuid);
						}
					}
				});
		}
	}
	async function callFilter(data: any, special: boolean) {
		await filterBlockedUsers(data);
		if (special)
			listUsers = listUsers.filter((user: any) => user.uuid !== data.uuid);
		dispatch(setConnectedList(listUsers));
	}
	socketSocial?.removeListener("listUsersConnected");
	socketSocial?.on('listUsersConnected', (data: any) => {
		callFilter(data, false);
	})

	socketSocial?.removeListener("disconnectFromServer");
	socketSocial?.on('disconnectFromServer', (data: any) => {
		callFilter(data, true);
	})

	socketSocial?.removeListener("playing");
	socketSocial?.on('playing', (data: any) => {
		dispatch(setInGameList(data.users));
	})

	socketSocial?.removeListener("notPlaying");
	socketSocial?.on('notPlaying', (data: any) => {
		dispatch(setInGameList(data.users));
	})
	return (
		<Router>
			{APIStatus ? (
				<Routes>

					<Route path="/" element={<Protected><HomePage /></Protected>}></Route>
					<Route path="/login" element={<SignIn />}></Route>
					<Route path="/login/return/" element={<GetToken />}></Route>
					<Route path="/settings" element={<Settings />}></Route>
					<Route path="/logout" element={<Protected><Logout /></Protected>}></Route>
					<Route path="/twoAuth" element={<ProtectedTwoAuth><TwoAuth /></ProtectedTwoAuth>}></Route>
					<Route path="/profile/:Username" element={<Protected><Profile /></Protected>}></Route>
					<Route path="/leaderboard" element={<Protected><Leaderboard /></Protected>}></Route>
					<Route path="/rules" element={<Protected><Rules /></Protected>}></Route>
					<Route path="/game/spectate" element={<Protected><GameSpectatePage /></Protected>}></Route>
					<Route path="/game/spectate/:roomId" element={<Protected><GameSpectatePage /></Protected>}></Route>
					<Route path="/chat/" element={<Protected><ChannelPage /></Protected>}></Route>
					<Route path="/chat/channel" element={<Protected><ChannelPage /></Protected>}></Route>
					<Route path="/chat/channel/:id" element={<Protected><ChannelPage /></Protected>}></Route>
					<Route path="/chat/dm" element={<Protected><DMPage /></Protected>}></Route>
					<Route path="/chat/dm/:id" element={<Protected><DMPage /></Protected>}></Route>
					<Route path="*" element={<NotFound />}></Route>
				</Routes>
			) : (
				<Routes>
					<Route
						path="*"
						element={<div>{APIStatus ? "API is up" : "API is down"}</div>}
					></Route>
				</Routes>
			)}
		</Router>
	);
}

export default App;