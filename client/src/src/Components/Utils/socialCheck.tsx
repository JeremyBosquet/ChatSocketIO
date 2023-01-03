import React from "react";
import { getSocketSocial, getFriendList, getBlockList, getRequestList, getRequestedList } from "../../Redux/userSlice";
import { setFriendList, setRequestList, setRequestedList, setBlockList } from '../../Redux/userSlice'
import { useDispatch, useSelector } from "react-redux";
import instance from "../../API/Instance";

export function IsFriend(uuid: string) {
	const friendList = useSelector(getFriendList);
	const userFriends: any[] = friendList;
	const test: any[] = userFriends.filter(friend => friend.uuid === uuid);
	if (!test)
		return true;
	return false;
}

export function IsRequested(uuid: string) {
	const requestedList = useSelector(getRequestedList);
	const userRequested: any[] = requestedList;
	const test: any[] = userRequested.filter(requested => requested.uuid === uuid);
	if (!test)
		return true;
	return false;
}

export function IsRequest(uuid: string) {
	const requestList = useSelector(getRequestList);
	const userRequest: any[] = requestList;
	const request: any[] = userRequest.filter(request => request.uuid === uuid);
	if (!request)
		return true;
	return false;
}

export async function AddOrRemoveFriend(uuid: string, User: any) {
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const friendList = useSelector(getFriendList);
	const requestedList = useSelector(getRequestedList);
	const userFriends: any[] = friendList;
	const test: any[] = userFriends.filter(friend => friend.uuid === uuid)
	if (!test) {
		await instance.post(`user/AddFriend`, { uuid: uuid }, {
			headers: ({
				Authorization: 'Bearer ' + localStorage.getItem('token'),
			})
		}).then((res) => {
			dispatch(setRequestedList([...requestedList, { uuid: uuid }]));
			socket?.emit('addFriend', { uuid: uuid, myUUID: User.uuid })
		});
	}
	else {
		await instance.post(`user/RemoveFriend`, { uuid: uuid }, {
			headers: ({
				Authorization: 'Bearer ' + localStorage.getItem('token'),
			})
		}).then((res) => {
			const users: any[] = friendList.filter((element: any) => element.uuid !== uuid);
			dispatch(setFriendList(users));
			socket?.emit('removeOrBlock', { uuid: uuid, myUUID: User.uuid })
		});
	}
}

export async function AcceptFriend(uuid: string, image: any, User: any) {
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const friendList = useSelector(getFriendList);
	const requestList = useSelector(getRequestList);
	const test: any[] = requestList.filter((friend: any) => friend.uuid === uuid)
	if (test) {
		await instance.post(`user/AcceptFriend`, { uuid: uuid }, {
			headers: ({
				Authorization: 'Bearer ' + localStorage.getItem('token'),
			})
		}).then((res) => {
			const request: any[] = requestList.filter((element: any) => element.uuid !== uuid);
			dispatch(setFriendList([...friendList, { uuid: uuid, username: test[0].username, image: import.meta.env.VITE_URL_API + ":7000/" + image }]));
			dispatch(setRequestList(request));
			socket?.emit('acceptFriend', { uuid: uuid, myUUID: User.uuid });
		});
	}
}

export async function DeclineFriendAdd(uuid: string, User: any) {
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const requestList = useSelector(getRequestList);
	const test: any[] = requestList.filter((friend: any) => friend.uuid === uuid)
	if (test) {
		await instance.post(`user/DeclineFriendAdd`, { uuid: uuid }, {
			headers: ({
				Authorization: 'Bearer ' + localStorage.getItem('token'),
			})
		}).then((res) => {
			const request: any[] = requestList.filter((element: any) => element.uuid !== uuid);
			dispatch(setRequestList(request));
			socket?.emit('DeclineFriendAdd', { uuid: uuid, myUUID: User.uuid });
		});
	}
}

export async function CancelFriendAdd(uuid: string, User: any) {
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const requestedList = useSelector(getRequestedList);
	const test: any[] = requestedList.filter((friend: any) => friend.uuid === uuid)
	if (test) {
		await instance.post(`user/CancelFriendAdd`, { uuid: uuid }, {
			headers: ({
				Authorization: 'Bearer ' + localStorage.getItem('token'),
			})
		}).then((res) => {
			const requested: any[] = requestedList.filter((element: any) => element.uuid !== uuid);
			dispatch(setRequestedList(requested));
			socket?.emit('CancelFriendAdd', { uuid: uuid, myUUID: User.uuid });
		});
	}
}

export async function BlockOrUnblockUser(uuid: string, User: any) {
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const friendList = useSelector(getFriendList);
	const blockList = useSelector(getBlockList);
	const requestedList = useSelector(getRequestedList);
	const requestList = useSelector(getRequestList);
	const userBlocked: any[] = blockList;
	const test: any[] = userBlocked.filter(blocked => blocked.uuid === uuid)
	if (!test) {
		await instance.post(`user/BlockUser`, { uuid: uuid }, {
			headers: ({
				Authorization: 'Bearer ' + localStorage.getItem('token'),
			})
		}).then((res) => {
			const users: any[] = friendList.filter((element: any) => element.uuid !== uuid);
			const request: any[] = requestList.filter((element: any) => element.uuid !== uuid);
			const requested: any[] = requestedList.filter((element: any) => element.uuid !== uuid);
			dispatch(setFriendList(users));
			dispatch(setBlockList([...blockList, { uuid: uuid }]));
			dispatch(setRequestList(request));
			dispatch(setRequestedList(requested));
			socket?.emit('removeOrBlock', { uuid: uuid, myUUID: User.uuid })
			socket?.emit('CancelFriendAdd', { uuid: uuid, myUUID: User.uuid });
			socket?.emit('DeclineFriendAdd', { uuid: uuid, myUUID: User.uuid });
			socket?.emit('Block', { uuid: uuid, myUUID: User.uuid });
		});
	}
	else {
		await instance.post(`user/UnblockUser`, { uuid: uuid }, {
			headers: ({
				Authorization: 'Bearer ' + localStorage.getItem('token'),
			})
		}).then((res) => {
			const users: any[] = friendList.filter((element: any) => element.uuid !== uuid);
			dispatch(setFriendList(users));
			dispatch(setBlockList(blockList.filter((user: any) => user.uuid !== uuid)));
			socket?.emit('Unblock', { uuid: uuid, myUUID: User.uuid });
		});
	}
}
