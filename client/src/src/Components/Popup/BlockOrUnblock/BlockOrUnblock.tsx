import React from "react"
import { MdBlock } from "react-icons/md";
import { getBlockList, getFriendList, getProfilePage, getRequestedList, getRequestList, getSocketSocial, setBlockList, setFriendList, setRequestedList, setRequestList } from "../../../Redux/userSlice";
import { CgUnblock } from "react-icons/cg";
import { useDispatch, useSelector } from "react-redux";
import instance from "../../../API/Instance";


interface props {
	User: any;
	UserUuid: string;
}

function BlockOrUnblock(props: props) {
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const friendList = useSelector(getFriendList);
	const blockList = useSelector(getBlockList);
	const requestedList = useSelector(getRequestedList);
	const requestList = useSelector(getRequestList);
	const profilePage = useSelector(getProfilePage);

	async function BlockOrUnblockUser(uuid: string) {
		const userBlocked: any[] = blockList;
		const test: any[] = userBlocked.filter(blocked => blocked.uuid === uuid)
		if (!test.length) {
			await instance.post(`user/BlockUser`, { uuid: uuid }, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then(() => {
				const users: any[] = friendList.filter((element: any) => element.uuid !== uuid);
				const request: any[] = requestList.filter((element: any) => element.uuid !== uuid);
				const requested: any[] = requestedList.filter((element: any) => element.uuid !== uuid);
				dispatch(setFriendList(users));
				dispatch(setBlockList([...blockList, { uuid: uuid }]));
				dispatch(setRequestList(request));
				dispatch(setRequestedList(requested));
				socket?.emit('removeOrBlock', { uuid: uuid, myUUID: props.User.uuid })
				socket?.emit('CancelFriendAdd', { uuid: uuid, myUUID: props.User.uuid });
				socket?.emit('DeclineFriendAdd', { uuid: uuid, myUUID: props.User.uuid });
				socket?.emit('Block', { uuid: uuid, myUUID: props.User.uuid });
			}).catch((err) => {
				console.log(err.response.data.message);
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
				socket?.emit('Unblock', { uuid: uuid, myUUID: props.User.uuid });
			}).catch((err) => {
				console.log(err.response.data.message);
			});
		}
	}

	function IsntBlocked(uuid: string) {
		const userBlocked: any[] = blockList;
		const test: any[] = userBlocked.filter(blocked => blocked.uuid === uuid);
		if (!test.length)
			return true;
		return false;
	}

	return (
		props.UserUuid ?
			<button title="Block or unblock user" onClick={() => (BlockOrUnblockUser(props.UserUuid))} > {IsntBlocked(props.UserUuid) ? <MdBlock /> : <CgUnblock />} </button>
			:
			<button title="Block or unblock user" onClick={() => (BlockOrUnblockUser(profilePage.uuid))} > {IsntBlocked(profilePage.uuid) ? <MdBlock /> : <CgUnblock />} </button>
	);
}

export default BlockOrUnblock;