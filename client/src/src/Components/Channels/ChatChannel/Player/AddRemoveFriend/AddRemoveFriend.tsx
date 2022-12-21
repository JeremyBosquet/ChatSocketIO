
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getBlockList, getFriendList, getRequestedList, getRequestList, getSocketSocial, getUser, setBlockList, setFriendList, setRequestedList, setRequestList } from "../../../../../Redux/authSlice";
import { getSocket } from "../../../../../Redux/chatSlice";
import { Iuser, IuserDb } from "../../interfaces/users";
import React, { useEffect, useState } from 'react';
import { createNotification } from "../../../../notif/Notif";
import { IsFriend } from "../../../../Utils/socialCheck";

interface props {
		user: IuserDb;
}

function AddRemoveFriend(props : props) {
	const [blocked, setBlocked] = useState<boolean>(false);
	const [isBlockedBy, setIsBlockedBy] = useState<boolean>(false);
	const [isFriend, setIsFriend] = useState<boolean>(false);
	const [isRequest, setIsRequest] = useState<boolean>(false);
	const [isRequested, setIsRequested] = useState<boolean>(false);

	const socketSocial = useSelector(getSocketSocial);
	const friendList = useSelector(getFriendList);
	const requestList = useSelector(getRequestList);
	const requestedList = useSelector(getRequestedList);
	const me : Iuser = useSelector(getUser);
	const params = useParams();
	// const selectedChannel = params.id || "";
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const blockedUsers = useSelector(getBlockList);

	async function AddOrRemoveFriend(uuid : string) {
		if (!isFriend)
		{
			await instance.post(`user/AddFriend`, {uuid : uuid}, {
				headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				dispatch(setRequestedList([...requestedList, {uuid : uuid}]));
				socketSocial?.emit('addFriend', {uuid : uuid, myUUID : me.uuid});
				setIsRequested(true);
			}).catch((err) => {
				setIsRequested(false);
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
				socketSocial?.emit('removeOrBlock', {uuid : uuid, myUUID : me.uuid})
				setIsFriend(false);
				// setIsRequest(false);
				// setIsRequested(false);
			}).catch((err) => {
				setIsFriend(false);
				console.log(err.response.data.message);
			});
		}
	}

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
				socketSocial?.emit('CancelFriendAdd', {uuid : uuid, myUUID : me.uuid});
				setIsFriend(false);
			}).catch((err) => {
				setIsFriend(false);
				console.log(err.response.data.message);
			});
		}
	}

	async function getUserData(uuid: string) {
		let userData : any = [];
		await instance.get(`findUser/` + uuid, {
			headers: {
				Authorization: "Bearer " + localStorage.getItem("token"),
			},
		})
		.then((res) => {
			if (res.data.User)
				userData = res.data.User;
		})

		return userData;
	}

	async function AcceptFriend(uuid : string) {

		const test : any[] = requestList.filter((friend : any) => friend.uuid === uuid)
		if (test.length)
		{
			const acceptThisUser = await getUserData(test[0]?.uuid);
			await instance.post(`user/AcceptFriend`, {uuid : uuid}, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				const request : any[] = requestList.filter((element : any) => element.uuid !== uuid);
				dispatch(setFriendList([...friendList, {uuid : uuid , username : test[0].username, image : acceptThisUser.image}]));
				dispatch(setRequestList(request));
				socketSocial?.emit('acceptFriend', {uuid : uuid, myUUID : me.uuid});
				setIsFriend(true);
			}).catch((err) => {
				setIsFriend(false);
				console.log(err.response.data.message);
			});
		}
	}

	useEffect(() => {
		function IsFriend(uuid : string) {
			const userFriends : any[] = friendList;
			const test : any[] = userFriends.filter(friend => friend.uuid === uuid);
			console.log(test)
			if (test.length)
			{
				setIsFriend(true);
				return true;
			}
			setIsFriend(false);
			return false;
		}

		async function IsBlocked(user: IuserDb) {
			let userFinded = blockedUsers.find((userSearch : any) => userSearch.uuid === user.uuid);
			if (userFinded)
			{
				setBlocked(true);
				return (true);
			}
			setBlocked(false);
			return (false);
		}

		async function IsRequest(user: IuserDb) {
			let userFinded = requestList.find((userSearch : any) => userSearch.uuid === user.uuid);
			if (userFinded)
			{
				setIsRequest(true);
				return (true);
			}
			setIsRequest(false);
			return (false);
		}

		async function IsRequested(user: IuserDb) {
			let userFinded = requestedList.find((userSearch : any) => userSearch.uuid === user.uuid);
			if (userFinded)
			{
				setIsRequested(true);
				return (true);
			}
			setIsRequested(false);
			return (false);
		}


		console.log()
		IsFriend(props.user.uuid);
		IsRequest(props.user);
		IsRequested(props.user);
		IsBlocked(props.user);
	}, [blockedUsers, friendList, requestList, requestedList]);

	return (
		<>
			{ blocked ?
					null
				:
				<>
					{ 
						!isFriend && !isRequest && !isRequested ?
							<button className="actionButton" onClick={(e) => (AddOrRemoveFriend(props.user.uuid))} >Add friend</button>
						: null
					}
					{
						isRequested && !isRequest && !isFriend
						?
							<button className="actionButton" onClick={(e) => (CancelFriendAdd(props.user.uuid))} >Cancel request</button>
						:
							<></>
					}

					{
						isRequest && !isRequested && !isFriend
						?
							<button className="actionButton" onClick={(e) => (AcceptFriend(props.user.uuid))} >Accept friend</button>
						:
							<></>
					}
					{
						isFriend && !isRequested && !isRequest
						?
							<button className="actionButton" onClick={(e) => (AddOrRemoveFriend(props.user.uuid))} >Remove friend</button>
						:
							<></>
					}
				</>
			}

			{/* { !blocked ?
				{ !isFriend && !isRequested && !isRequesting ?
					<button onClick={(e) => (AddFriend(props.user.uuid))} >Add friend</button>
				:
					<>
						{ isFriend ?
							<button onClick={(e) => (RemoveFriend(props.user.uuid))} >Remove friend</button>	
						:
							<>
								{ isRequested ?
									<button onClick={(e) => (CancelFriendAdd(props.user.uuid))} >Refuse friend</button>
								:
									<button onClick={(e) => (AcceptFriend(props.user.uuid, props.user.image))} > <span className='green'>Accept friend</span> </button>
								}
							</>
						}
					</>
				}
			} */}
		</>
	);
}

export default AddRemoveFriend;