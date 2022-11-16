import React from "react";
import axios from "axios";
import { Socket } from "socket.io-client";
export function IsFriend(uuid : string, friendList : any[]) {
	const userFriends : any[] = friendList;
	const test : any[] = userFriends.filter(friend => friend.uuid === uuid);
	if (!test.length)
		return true;
	return false;
}

export function IsRequested(uuid : string, requestedList : any[]) {
	const userRequested : any[] = requestedList;
	const test : any[] = userRequested.filter(requested => requested.uuid === uuid);
	if (!test.length)
		return true;
	return false;
}

export function IsRequest(uuid : string, requestList : any[]) {
	const userRequest : any[] = requestList;
	const request : any[] = userRequest.filter(request => request.uuid === uuid);
	if (!request.length)
		return true;
	return false;
}

export function IsBlocked(uuid : string, blockList: any[]) {
	const userBlocked : any[] = blockList;
	const test : any[] = userBlocked.filter(blocked => blocked.uuid === uuid);
	if (!test.length)
		return true;
	return false;
}

export async function AddOrRemoveFriend(uuid : string, friendList: any[], SetRequestedList : any, requestedList : any[], socket : (Socket | undefined), User : any, SetFriendList : any) {
	const userFriends : any[] = friendList;
	const test : any[] = userFriends.filter(friend => friend.uuid === uuid)
	if (!test.length)
	{
		await axios.post(`http://90.66.192.148:7000/user/AddFriend`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
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
				Authorization: 'Bearer ' + localStorage.getItem('token'),
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

export async function AcceptFriend(uuid : string, image : any, requestList : any[], SetRequestList : any, SetFriendList : any, friendList: any[], socket : (Socket | undefined), User : any) {
	const test : any[] = requestList.filter(friend => friend.uuid === uuid)
	if (test.length)
	{
		await axios.post(`http://90.66.192.148:7000/user/AcceptFriend`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
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

export async function DeclineFriendAdd(uuid : string, requestList : any[], SetRequestList : any, socket : (Socket | undefined), User : any) {
	const test : any[] = requestList.filter(friend => friend.uuid === uuid)
	if (test.length)
	{
		await axios.post(`http://90.66.192.148:7000/user/DeclineFriendAdd`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
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

export async function CancelFriendAdd(uuid : string, requestedList : any[], SetRequestedList : any, socket : (Socket | undefined), User : any) {
	const test : any[] = requestedList.filter(friend => friend.uuid === uuid)
	if (test.length)
	{
		await axios.post(`http://90.66.192.148:7000/user/CancelFriendAdd`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
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

export async function BlockOrUnblockUser(uuid : string, blockList : any[], socket : (Socket | undefined), User : any,
	friendList : any[], SetFriendList : any,
	requestList : any[], SetRequestList : any,
	requestedList : any[], SetRequestedList : any,
	SetBlockList : any) {
	const userBlocked : any[] = blockList;
	const test : any[] = userBlocked.filter(blocked => blocked.uuid === uuid)
	if (!test.length)
	{
		await axios.post(`http://90.66.192.148:7000/user/BlockUser`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
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
				Authorization: 'Bearer ' + localStorage.getItem('token'),
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

export async function HideProfile(path : string, setProfileDisplayed : any, navigate : any)
{
	console.log(path);
	navigate(path);
	setProfileDisplayed(false);
	let blur = document.getElementById('blur');
	blur?.classList.toggle('active');
	let popup = document.getElementById('popup');
	popup?.classList.toggle('active');
}