
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useNavigation, } from "react-router-dom"
import { createNotification } from '../notif/Notif';
import io, { Socket } from 'socket.io-client';
import { Link, useLocation } from 'react-router-dom';
import React from 'react';
//const style = require('./Social.scss');
import './Social.scss';
import NavBar from '../Nav/NavBar';
// import { AddOrRemoveFriend, CancelFriendAdd, AcceptFriend, DeclineFriendAdd, BlockOrUnblockUser} from "../../Components/Utils/socialCheck"
import { getSocketSocial, getFriendList, getBlockList, getRequestList, getRequestedList, getHistoryList, getProfileDisplayed, getProfilePage} from "../../Redux/userSlice";
import {setFriendList, setRequestList, setRequestedList, setProfileDisplayed, setHistoryList, setBlockList, setProfilePage} from '../../Redux/userSlice'
import { useDispatch, useSelector } from 'react-redux';
import Show from '../Popup/Show/Show';
import BlockOrUnblock from '../Popup/BlockOrUnblock/BlockOrUnblock';
import AddOrRemove from '../Popup/AddOrRemove/AddOrRemove';
import Accept from '../Popup/Accept/Accept';
import Decline from '../Popup/Decline/Decline';
import Cancel from '../Popup/Cancel/Cancel';
import {GoPrimitiveDot} from 'react-icons/go'
import IsOnline from '../Utils/IsOnline';
import instance from '../../API/Instance';
//import RxDotFilled from 'react-icons/rx'

function Social() {
	let navigate = useNavigate();
	let location = useLocation();
	const booleffect = useRef<boolean>(false);
	const booleffect2 = useRef<boolean>(false);
	const [booleffect3, setbooleffect3] = useState<boolean>(true);
	const token = localStorage.getItem('token');
	let boolFriendOrNot : boolean = false;

	const [friendRequest, setFriendRequest] = useState<number>();
	//const [requestList, SetRequestList] = useState<any[]>([]);
	const firstrender = useRef<boolean>(true);
	const [searchList, SetsearchList] = useState<any[]>([]);
	const [searchFriend, SetsearchFriend] = useState<string>();
	const [friendStatus, SetfriendStatus] = useState<string>();


	let requestTab: any[] = [];
	let friendTab: any[] = [];
	let requestedTab: any[] = [];
	let statusTab: typeof useState[];
	const [User, setUser] = useState<any>();

	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const friendList = useSelector(getFriendList);
	const blockList = useSelector(getBlockList);
	const requestedList = useSelector(getRequestedList);
	const requestList = useSelector(getRequestList);
	const profilePage = useSelector(getProfilePage);
	const profileDisplayed = useSelector(getProfileDisplayed);
	const historyList = useSelector(getHistoryList);
	
	async function GetLoggedInfoAndUser() {
		if (localStorage.getItem('token')) {
			await instance.get(`user`, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				setUser(res.data.User);
			}).catch((err) => {
				console.log(err.message);
				setUser(undefined);
				navigate("/");
			});
		}
		else
			navigate("/");
		setbooleffect3(false);
	}

	async function ListFriends() {
		await instance.get(`user/ListFriends`, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				dispatch(setFriendList(res.data.friendList));
			}).catch((err) => {
				console.log(err.message);
			});
	}

	async function ListRequested() {
		await instance.get(`user/ListFriendRequested`, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				dispatch(setRequestedList(res.data.ListFriendsRequested));
			}).catch((err) => {
				console.log(err.message);
			});
	}

	async function ListBlocked() {
		await instance.get(`user/ListUsersBlocked`, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				dispatch(setBlockList(res.data.ListUsersblocked));
			}).catch((err) => {
				console.log(err.message);
			});
	}

	async function SearchFriend(username : string) {
		await instance.get(`user/SearchFriend/` + username, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				if (res && res.data)
					SetsearchList(res.data.searchResult)
				else
					SetsearchList([]);
			}).catch((err) => {
				console.log(err.response.data.message);
			});
	}

	function IsntRequested(uuid : string) {
		const userRequested : any[] = requestedList;
		const test : any[] = userRequested.filter(requested => requested.uuid === uuid);
		if (!test.length)
			return true;
		return false;
	}

	function IsntRequest(uuid : string) {
		const userRequest : any[] = requestList;
		const request : any[] = userRequest.filter(request => request.uuid === uuid);
		if (!request.length)
			return true;
		return false;
	}

	function IsBlocked(uuid : string) {
		const userBlocked : any[] = blockList;
		const test : any[] = userBlocked.filter(blocked => blocked.uuid === uuid);
		if (!test)
			return true;
		return false;
	}

	useEffect(() => {
		if (!booleffect.current) {
				GetLoggedInfoAndUser();
				ListFriends();
				ListBlocked()
				ListRequested();
			booleffect.current = true;
		}
	}, []);

	return (
		<div className='SocialPage'>
		{
			<>
			{
				!(booleffect3) ?
				(
					<>
					<div className="container">
						<div>
							<div id='listSearchParent'>
								<h3> Search Friends </h3>
								<form >
									<input
									type="text"
									id="friendusername"
									name="friendusername"	
									required
									maxLength={16}
									onChange={e  => SearchFriend(e.target.value)}
									/>
								</form>
								<div className='box'>
								{
									searchList.length ?
									(
										<div id={searchList.length > 3 ? "listSearchScroll" : "listSearch"}>
										{
											searchList.map((user, index) => (
											<div key={user.uuid} className='mapSearch'>
												<img className="icon" src={import.meta.env.VITE_URL_API + ":7000/" + user?.image} alt="user_img" width="36" height="27"/>
												<p> {user.username} </p>
												<div className='status'>
												{
													<IsOnline uuid={user.uuid}/>
												}
												</div>
												<div className='buttons'>
													<Show trueUsername={user.trueUsername}/>
													<BlockOrUnblock UserUuid={user.uuid} User={User}/>
												</div>
												<div>
												{
													IsntRequested(user.uuid) ?
													(
														IsntRequest(user.uuid) ?
														(
															<div className='buttons2'>
																<AddOrRemove User={User} UserUuid={user.uuid}/>
															</div>
														)

														:

														(
															<div className='buttons2'>
																<Accept User={User} UserUuid={user.uuid} UserImg={user?.image}/>
																<Decline User={User} UserUuid={user.uuid} />
															</div>
														)
								
													)
													:
													<div className='buttons2'>
														<Cancel User={User} UserUuid={user.uuid} />
													</div>
												}
												</div>
											</div>))
										}
										</div>
									)

									:

										null
								}
								</div>
							</div>
						</div>
						<div id='listFriendParent'>
							<div>
							<h3> Friend List </h3>
							<div className='box'>
							{
								friendList.length ?
								(
									<div id={friendList.length > 3 ? 'listFriendScroll' : 'listFriend'}>
									{
										friendList.map((user : any) => (
											<div key={user.uuid} className='mapFriend'> 
												<img className="icon" src={import.meta.env.VITE_URL_API + ":7000/" + user?.image} alt="user_img" width="36" height="27"/>
												<p> {user.username} </p>
												<div className='status'>
												{
													<IsOnline uuid={user.uuid}/>
												}
												</div>
												<div className='buttons'>
													<AddOrRemove User={User} UserUuid={user.uuid}/>
													<Show trueUsername={user.trueUsername}/>
													<BlockOrUnblock UserUuid={user.uuid} User={User}/>
												</div>
											</div>
										))
									}
									</div>
								)

								:

									null
							}
							</div>
							</div>
						</div>
						
						<div id='listReqParent'>
						{
							<div>
								<h3> Friend requests </h3>		
								<div className='box'>
								{								
									requestList.length ?
									(
										<div id={requestList.length > 3 ? 'listReqScroll' : 'listReq'}>
										{
											requestList.map((user : any, index : number) => (
											<div key={index} className='mapReq'> 
												<img className="icon" src={import.meta.env.VITE_URL_API + ":7000/" + user?.image} alt="user_img" width="36" height="27"/>
												<p> {user?.username} </p>
												<div className='status'>
												{
													<IsOnline uuid={user.uuid}/>
												}
												</div>
												<div className='buttons'>
													<Show trueUsername={user.trueUsername}/>
													<BlockOrUnblock UserUuid={user.uuid} User={User}/>
													<Accept User={User} UserUuid={user.uuid} UserImg={user?.image}/>
													<Decline User={User} UserUuid={user.uuid} />
												</div>
											</div>))
										}
										</div>
									)

									:

									null							
								}
								</div>
							</div>
						}
						</div>
					</div>
					{/* </div> */}
					</>
					
				)

				:
					null
				}
			</>
		}
		</div>
	)
}

export default Social;