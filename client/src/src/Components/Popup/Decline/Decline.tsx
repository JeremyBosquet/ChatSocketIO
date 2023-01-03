
import React from "react"
import { useDispatch, useSelector } from "react-redux";
import { getProfilePage, getRequestList, getSocketSocial, setRequestList } from "../../../Redux/userSlice";
import { ImCross } from "react-icons/im";
import instance from "../../../API/Instance";

interface props {
	User: any,
	UserUuid: string,
}

function Decline(props: props) {
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const requestList = useSelector(getRequestList);
	const profilePage = useSelector(getProfilePage);


	async function DeclineFriendAdd(uuid: string) {
		const test: any[] = requestList.filter((friend: any) => friend.uuid === uuid)
		if (test.length) {
			await instance.post(`user/DeclineFriendAdd`, { uuid: uuid }, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				const request: any[] = requestList.filter((element: any) => element.uuid !== uuid);
				dispatch(setRequestList(request));
				socket?.emit('DeclineFriendAdd', { uuid: uuid, myUUID: props.User.uuid });
			}).catch((err) => {
				console.log(err.response.data.message);
			});
		}
	}
	return (
		props.UserUuid ?
			<button onClick={(e) => (DeclineFriendAdd(props.UserUuid))} > <span className='red'><ImCross /></span> </button>
			:
			<button onClick={(e) => (DeclineFriendAdd(profilePage.uuid))} > <span className='red'><ImCross /></span> </button>
	);
}

export default Decline;