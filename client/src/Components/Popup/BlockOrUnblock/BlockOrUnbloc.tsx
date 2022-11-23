import React from "react"
import {MdCancelScheduleSend, MdBlock} from "react-icons/md";
import { getBlockList, getFriendList, getHistoryList, getProfileDisplayed, getRequestedList, getRequestList, getSocketSocial, setBlockList, setFriendList, setRequestedList, setRequestList } from "../../../Redux/authSlice";
import {CgUnblock} from "react-icons/cg";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

interface props {
	profilePage: any;
	User: any;
}

function BlockOrUnblock (props : props) {
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const friendList = useSelector(getFriendList);
	const blockList = useSelector(getBlockList);
	const requestedList = useSelector(getRequestedList);
	const requestList = useSelector(getRequestList);
	const userBlocked : any[] = blockList;

	async function BlockOrUnblockUser(uuid : string) {
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
					socket?.emit('removeOrBlock', {uuid : uuid, myUUID : props.User.uuid})
					socket?.emit('CancelFriendAdd', {uuid : uuid, myUUID : props.User.uuid});
					socket?.emit('DeclineFriendAdd', {uuid : uuid, myUUID : props.User.uuid});
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

	function IsBlocked(uuid : string) {
		const userBlocked : any[] = blockList;
		const test : any[] = userBlocked.filter(blocked => blocked.uuid === uuid);
		if (!test.length)
			return true;
		return false;
	}

	return (
		<button onClick={() => (BlockOrUnblockUser(props.profilePage?.uuid))} > {IsBlocked(props.profilePage?.uuid) ? <MdBlock/>: <CgUnblock/>} </button>
	)
}

export default BlockOrUnblock;