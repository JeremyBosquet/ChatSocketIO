import axios from "axios";
import React from "react"
import { useDispatch, useSelector } from "react-redux";
import { getBlockList, getFriendList, getHistoryList, getProfileDisplayed, getRequestedList, getRequestList, getSocketSocial, setBlockList, setFriendList, setRequestedList, setRequestList } from "../../../Redux/authSlice";
import {ImCross, ImCheckmark} from "react-icons/im";

interface props{
	profilePage: any;
	User : any;
}

function Accept(props : props){
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const friendList = useSelector(getFriendList);
	const requestList = useSelector(getRequestList);

	async function AcceptFriend(uuid : string, image : any) {
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
					socket?.emit('acceptFriend', {uuid : uuid, myUUID : props.User.uuid});
				}).catch((err) => {
					console.log(err.response.data.message);
				});
		}
	}

	return (
		<button onClick={() => (AcceptFriend(props.profilePage?.uuid, props.profilePage?.image))} > <span className='green'><ImCheckmark/></span> </button>
	);
}

export default Accept;