
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom"
import React from 'react';
import './Social.scss';
import { getFriendList, getBlockList, getRequestList, getRequestedList, setRequestList } from "../../Redux/userSlice";
import { setFriendList, setRequestedList, setBlockList } from '../../Redux/userSlice'
import { useDispatch, useSelector } from 'react-redux';
import Show from '../Popup/Show/Show';
import BlockOrUnblock from '../Popup/BlockOrUnblock/BlockOrUnblock';
import AddOrRemove from '../Popup/AddOrRemove/AddOrRemove';
import Accept from '../Popup/Accept/Accept';
import Decline from '../Popup/Decline/Decline';
import Cancel from '../Popup/Cancel/Cancel';
import IsOnline from '../Utils/IsOnline';
import instance from '../../API/Instance';
import DM from '../Channels/ChatChannel/Player/DM/DM';
import Dm from '../Popup/Dm/Dm';
import Spectate from '../Popup/Spectate/Spectate';

function Social() {
	let navigate = useNavigate();
	const booleffect = useRef<boolean>(false);
	const [booleffect3, setbooleffect3] = useState<boolean>(true);
	const token = localStorage.getItem('token');
	const [searchList, SetsearchList] = useState<any[]>([]);
	const [User, setUser] = useState<any>();

	const dispatch = useDispatch();
	const friendList = useSelector(getFriendList);
	const blockList = useSelector(getBlockList);
	const requestedList = useSelector(getRequestedList);
	const requestList = useSelector(getRequestList);

	async function GetLoggedInfoAndUser() {
		if (localStorage.getItem('token')) {
			await instance.get(`user`, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
			}).then((res) => {
				setUser(res.data.User);
			}).catch((err) => {
				setUser(undefined);
				navigate("/");
			});
		}
		else
			navigate("/");
		setbooleffect3(false);
	}

	async function ListFriends() {
		await instance.get(`user/ListFriends`).then((res) => {
			dispatch(setFriendList(res.data.friendList));
		});
	}

	async function ListRequested() {
		await instance.get(`user/ListFriendRequested`).then((res) => {
			dispatch(setRequestedList(res.data.ListFriendsRequested));
		});
	}

	async function ListRequest() {
		await instance.get(`user/ListFriendRequest`).then((res) => {
			dispatch(setRequestList(res.data.usernameList));
		});
	}

	async function ListBlocked() {
		await instance.get(`user/ListUsersBlocked`).then((res) => {
			dispatch(setBlockList(res.data.ListUsersblocked));
		});
	}

	async function SearchFriend(username: string) {
		await instance.get(`user/SearchFriend/` + username).then((res) => {
			if (res && res.data)
				SetsearchList(res.data.searchResult)
			else
				SetsearchList([]);
		});
	}

	function IsntRequested(uuid: string) {
		const userRequested: any[] = requestedList;
		const test: any[] = userRequested.filter(requested => requested.uuid === uuid);
		if (!test.length)
			return true;
		return false;
	}

	function IsntRequest(uuid: string) {
		const userRequest: any[] = requestList;
		const request: any[] = userRequest.filter(request => request.uuid === uuid);
		if (!request.length)
			return true;
		return false;
	}

	function IsBlocked(uuid: string) {
		const userBlocked: any[] = blockList;
		const test: any[] = userBlocked.filter(blocked => blocked.uuid === uuid);
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
			ListRequest();
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
									<div>
										<div>
											<div id='listSearchParent'>
												<h3> Search Friends </h3>
												<form onSubmit={(e) => (e.preventDefault())}>
													<input
														type="text"
														id="friendusername"
														name="friendusername"
														required
														maxLength={16}
														onChange={e => SearchFriend(e.target.value)}
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
																				<img className="icon" src={import.meta.env.VITE_URL_API + ":7000/" + user?.image} alt="user_img" width="36" height="27" />
																				<p> {user.username} </p>
																				<div className='status'>
																					{
																						<IsOnline uuid={user.uuid} />
																					}
																				</div>
																				<div className='buttons'>
																					<Show trueUsername={user.trueUsername} />
																					<Dm user={user} myUuid={User.uuid} />
																					<BlockOrUnblock UserUuid={user.uuid} User={User} />
																				</div>
																				<div>
																					{
																						IsntRequested(user.uuid) ?
																							(
																								IsntRequest(user.uuid) ?
																									(
																										<div className='buttons2'>
																											<AddOrRemove User={User} UserUuid={user.uuid} />
																										</div>
																									)

																									:

																									(
																										<div className='buttons2'>
																											<Accept User={User} UserUuid={user.uuid} UserImg={user?.image} />
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
																		friendList.map((user: any) => (
																			<div key={user.uuid} className='mapFriend'>
																				<img className="icon" src={import.meta.env.VITE_URL_API + ":7000/" + user?.image} alt="user_img" width="36" height="27" />
																				<p> {user.username} </p>
																				<div className='status'>
																					{
																						<IsOnline uuid={user.uuid} />
																					}
																				</div>
																				<div className='buttons'>
																					<AddOrRemove User={User} UserUuid={user.uuid} />
																					<Show trueUsername={user.trueUsername} />
																					<Dm user={user} myUuid={User.uuid}/>
																					<Spectate uuid={user.uuid} />
																					<BlockOrUnblock UserUuid={user.uuid} User={User} />
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
																			requestList.map((user: any, index: number) => (
																				<div key={index} className='mapReq'>
																					<img className="icon" src={import.meta.env.VITE_URL_API + ":7000/" + user?.image} alt="user_img" width="36" height="27" />
																					<p> {user?.username} </p>
																					<div className='status'>
																						{
																							<IsOnline uuid={user.uuid} />
																						}
																					</div>
																					<div className='buttons'>
																						<Show trueUsername={user.trueUsername} />
																						<BlockOrUnblock UserUuid={user.uuid} User={User} />
																						<Dm user={user} myUuid={User.uuid}/>
																						<Accept User={User} UserUuid={user.uuid} UserImg={user?.image} />
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