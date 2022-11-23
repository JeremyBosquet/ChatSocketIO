import React from "react";
import axios from "axios";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { getSocketSocial, getFriendList, getBlockList, getRequestList, getRequestedList, getHistoryList, getProfileDisplayed, getProfilePage } from "../../Redux/authSlice";
import {setFriendList, setRequestList, setRequestedList, setProfileDisplayed, setBlockList} from '../../Redux/authSlice'
import { useDispatch, useSelector } from "react-redux";

export function IsFriend(uuid : string) {
	const friendList = useSelector(getFriendList);	
	const userFriends : any[] = friendList;
	const test : any[] = userFriends.filter(friend => friend.uuid === uuid);
	if (!test.length)
		return true;
	return false;
}

export function IsRequested(uuid : string) {
	const requestedList = useSelector(getRequestedList);
	const userRequested : any[] = requestedList;
	const test : any[] = userRequested.filter(requested => requested.uuid === uuid);
	if (!test.length)
		return true;
	return false;
}

export function IsRequest(uuid : string) {
	const requestList = useSelector(getRequestList);
	const userRequest : any[] = requestList;
	const request : any[] = userRequest.filter(request => request.uuid === uuid);
	if (!request.length)
		return true;
	return false;
}

export async function AddOrRemoveFriend(uuid : string, User : any) {
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const friendList = useSelector(getFriendList);
	const requestedList = useSelector(getRequestedList);
	const userFriends : any[] = friendList;
	const test : any[] = userFriends.filter(friend => friend.uuid === uuid)
	if (!test.length)
	{
		await axios.post(`http://90.66.192.148:7000/user/AddFriend`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				dispatch(setRequestedList([...requestedList, {uuid : uuid}]));
				socket?.emit('addFriend', {uuid : uuid, myUUID : User.uuid})
			}).catch((err) => {
				console.log(err.response.data.message);
			});
	}
	else
	{
		await axios.post(`http://90.66.192.148:7000/user/RemoveFriend`, {uuid : uuid}, {
			headers: ({
				Authorization: 'Bearer ' + localStorage.getItem('token'),
			})
		}).then((res) => {
			const users : any[] = friendList.filter((element : any) => element.uuid !== uuid);
			dispatch(setFriendList(users));
			socket?.emit('removeOrBlock', {uuid : uuid, myUUID : User.uuid})
		}).catch((err) => {
			console.log(err.response.data.message);
		});
	}
}

export async function AcceptFriend(uuid : string, image : any, User : any) {
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const friendList = useSelector(getFriendList);
	const requestList = useSelector(getRequestList);
	const test : any[] = requestList.filter((friend : any) => friend.uuid === uuid)
	if (test.length)
	{
		await axios.post(`http://90.66.192.148:7000/user/AcceptFriend`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				const request : any[] = requestList.filter((element : any) => element.uuid !== uuid);
				dispatch(setFriendList([...friendList, {uuid : uuid , username : test[0].username, image : image}]));
				dispatch(setRequestList(request));
				socket?.emit('acceptFriend', {uuid : uuid, myUUID : User.uuid});
			}).catch((err) => {
				console.log(err.response.data.message);
			});
	}
}

export async function DeclineFriendAdd(uuid : string, User : any) {
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const requestList = useSelector(getRequestList);
	const test : any[] = requestList.filter((friend : any) => friend.uuid === uuid)
	if (test.length)
	{
		await axios.post(`http://90.66.192.148:7000/user/DeclineFriendAdd`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				const request : any[] = requestList.filter((element : any) => element.uuid !== uuid);
				dispatch(setRequestList(request));
				socket?.emit('DeclineFriendAdd', {uuid : uuid, myUUID : User.uuid});
			}).catch((err) => {
				console.log(err.response.data.message);
			});
	}
}

export async function CancelFriendAdd(uuid : string, User : any) {
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const requestedList = useSelector(getRequestedList);
	const test : any[] = requestedList.filter((friend : any) => friend.uuid === uuid)
	if (test.length)
	{
		await axios.post(`http://90.66.192.148:7000/user/CancelFriendAdd`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				const requested : any[] = requestedList.filter((element : any) => element.uuid !== uuid);
				dispatch(setRequestedList(requested));
				socket?.emit('CancelFriendAdd', {uuid : uuid, myUUID : User.uuid});
			}).catch((err) => {
				console.log(err.response.data.message);
			});
	}
}

export async function BlockOrUnblockUser(uuid : string, User : any) {
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const friendList = useSelector(getFriendList);
	const blockList = useSelector(getBlockList);
	const requestedList = useSelector(getRequestedList);
	const requestList = useSelector(getRequestList);
	const userBlocked : any[] = blockList;
	const test : any[] = userBlocked.filter(blocked => blocked.uuid === uuid)
	if (!test.length)
	{
		await axios.post(`http://90.66.192.148:7000/user/BlockUser`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				const users : any[] = friendList.filter((element : any) => element.uuid !== uuid);
				const request : any[] = requestList.filter((element : any) => element.uuid !== uuid);
				const requested : any[] = requestedList.filter((element : any) => element.uuid !== uuid);
				dispatch(setFriendList(users));
				dispatch(setBlockList([...blockList,{uuid : uuid}]));
				dispatch(setRequestList(request));
				dispatch(setRequestedList(requested));
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
				Authorization: 'Bearer ' + localStorage.getItem('token'),
			})
		}).then((res) => {
			const users : any[] = friendList.filter((element : any) => element.uuid !== uuid);
			dispatch(setFriendList(users));
			dispatch(setBlockList(blockList.filter((user : any) => user.uuid !== uuid)));
		}).catch((err) => {
			console.log(err.response.data.message);
		});
	}
}

export async function HideProfile(path : string)
{
	const navigate = useNavigate();
	navigate(path);
	setProfileDisplayed(false);
	let blur = document.getElementsByClassName('blur');
	for (let i = 0; i < blur.length ; i++)
		blur[i]?.classList.toggle('active');
	let popup = document.getElementsByClassName('popup');
	for (let i = 0; i < popup.length ; i++)
		popup[i]?.classList.toggle('active');
}