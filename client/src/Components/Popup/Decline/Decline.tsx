import axios from "axios";
import React from "react"
import { useDispatch, useSelector } from "react-redux";
import {getFriendList, getRequestList, getSocketSocial, setRequestList } from "../../../Redux/authSlice";
import {ImCross} from "react-icons/im";

interface props{
	profilePage: any;
	User : any;
}

function Decline(props : props){
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const friendList = useSelector(getFriendList);
	const requestList = useSelector(getRequestList);

	async function DeclineFriendAdd(uuid : string) {
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
					socket?.emit('DeclineFriendAdd', {uuid : uuid, myUUID : props.User.uuid});
				}).catch((err) => {
					console.log(err.response.data.message);
				});
		}
	}
	return (
		<button onClick={(e) => (DeclineFriendAdd(props.profilePage?.uuid))} > <span className='red'><ImCross/></span> </button>
	);
}

export default Decline;