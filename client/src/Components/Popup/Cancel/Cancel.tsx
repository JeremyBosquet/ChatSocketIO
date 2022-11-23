import axios from "axios";
import React from "react"
import { useDispatch, useSelector } from "react-redux";
import {getFriendList, getRequestedList, getSocketSocial, setRequestedList } from "../../../Redux/authSlice";
import {MdCancelScheduleSend} from "react-icons/md";

interface props{
	profilePage: any;
	User : any;
}

function Cancel(props : props){
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const requestedList = useSelector(getRequestedList);

	async function CancelFriendAdd(uuid : string) {
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
					socket?.emit('CancelFriendAdd', {uuid : uuid, myUUID : props.User.uuid});
				}).catch((err) => {
					console.log(err.response.data.message);
				});
		}
	}

	return (
		<button onClick={(e) => (CancelFriendAdd(props.profilePage?.uuid))} > <MdCancelScheduleSend/> </button>	
	);
}

export default Cancel;