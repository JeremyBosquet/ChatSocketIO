import React from "react"
import { useNavigate } from "react-router-dom";
import {IoPersonRemoveSharp, IoPersonAddSharp} from 'react-icons/io5';
import { getBlockList, getFriendList, getHistoryList, getProfileDisplayed, getProfilePage, getRequestedList, getRequestList, getSocketSocial, setBlockList, setFriendList, setRequestedList, setRequestList } from "../../../Redux/authSlice";

import { useDispatch, useSelector } from "react-redux";
import instance from "../../../API/Instance";

interface props{
	User : any,
	UserUuid : string,
}
function AddOrRemove(props : props) {
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const friendList = useSelector(getFriendList);
	const requestedList = useSelector(getRequestedList);
	const profilePage = useSelector(getProfilePage);
	
	function IsntFriend(uuid : string) {
		const userFriends : any[] = friendList;
		const test : any[] = userFriends.filter(friend => friend.uuid === uuid);
		if (!test.length)
			return true;
		return false;
	}

	async function AddOrRemoveFriend(uuid : string) {
		const userFriends : any[] = friendList;
		const test : any[] = userFriends.filter(friend => friend.uuid === uuid)
		if (!test.length)
		{
			await instance.post(`user/AddFriend`, {uuid : uuid}, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
				}).then((res) => {
					dispatch(setRequestedList([...requestedList, {uuid : uuid}]));
					socket?.emit('addFriend', {uuid : uuid, myUUID : props.User.uuid})
				}).catch((err) => {
					console.log(err.response.data.message);
				});
		}
		else
		{
			await instance.post(`user/RemoveFriend`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				const users : any[] = friendList.filter((element : any) => element.uuid !== uuid);
				dispatch(setFriendList(users));
				socket?.emit('removeOrBlock', {uuid : uuid, myUUID : props.User.uuid})
			}).catch((err) => {
				console.log(err.response.data.message);
			});
		}
	}

	return (
		props.UserUuid ?
			<button onClick={() => (AddOrRemoveFriend(props.UserUuid))} > {IsntFriend(props.UserUuid) ? <IoPersonAddSharp/> : <IoPersonRemoveSharp/>} </button>
		:
			<button onClick={() => (AddOrRemoveFriend(profilePage.uuid))} > {IsntFriend(profilePage.uuid) ? <IoPersonAddSharp/> : <IoPersonRemoveSharp/>} </button>
	)
}

export default AddOrRemove;