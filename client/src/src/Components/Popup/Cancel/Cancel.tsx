
import React from "react"
import { useDispatch, useSelector } from "react-redux";
import {getFriendList, getProfilePage, getRequestedList, getSocketSocial, setRequestedList } from "../../../Redux/userSlice";
import {MdCancelScheduleSend} from "react-icons/md";
import instance from "../../../API/Instance";

interface props{
	User : any,
	UserUuid : string,
}

function Cancel(props : props){
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const requestedList = useSelector(getRequestedList);
	const profilePage = useSelector(getProfilePage);
	

	async function CancelFriendAdd(uuid : string) {
		const test : any[] = requestedList.filter((friend : any) => friend.uuid === uuid)
		if (test.length)
		{
			await instance.post(`user/CancelFriendAdd`, {uuid : uuid}, {
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
		props.UserUuid ?
			<button title="Cancel friend request" onClick={(e) => (CancelFriendAdd(props.UserUuid))} > <MdCancelScheduleSend/> </button>
		:
			<button title="Cancel friend request" onClick={(e) => (CancelFriendAdd(profilePage.uuid))} > <MdCancelScheduleSend/> </button>	
	);
}

export default Cancel;