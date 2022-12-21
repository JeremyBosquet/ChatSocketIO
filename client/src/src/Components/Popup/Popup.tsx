import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getBlockList, getFriendList, getHistoryList, getProfileDisplayed, getProfilePage, getRequestedList, getRequestList, getSocketSocial, setBlockList, setFriendList, setRequestedList, setRequestList } from "../../Redux/authSlice";
import { setProfileDisplayed} from '../../Redux/authSlice'
import { whoWon } from "../Utils/whoWon";
import ClosePopup from "./ClosePopup/ClosePopup";
import BlockOrUnblock from "./BlockOrUnblock/BlockOrUnblock";
import AddOrRemove from "./AddOrRemove/AddOrRemove";
import Accept from "./Accept/Accept";
import Decline from "./Decline/Decline";
import Cancel from "./Cancel/Cancel";
import {getExp} from '../../Components/Utils/getExp'
import axios from "axios";
import instance from "../../API/Instance";

interface props {
	User: any;
}

function Popup(props: props)
{
	const dispatch = useDispatch();
	const socket = useSelector(getSocketSocial);
	const friendList = useSelector(getFriendList);
	const blockList = useSelector(getBlockList);
	const requestedList = useSelector(getRequestedList);
	const requestList = useSelector(getRequestList);
	const profileDisplayed = useSelector(getProfileDisplayed);
	const profilePage = useSelector(getProfilePage);
	const navigate = useNavigate();
	const [historyList, setHistoryList] = useState<any[]>([]);
	const [scoreA, setScoreA] = useState<number[]>([]);
	const [scoreB, setScoreB] = useState<number[]>([]);

	const [ProfileExp, setProfileExp] = useState<any>();
	const firstrender = useRef<boolean>(true);

	function IsRequested(uuid : string) {
		const userRequested : any[] = requestedList;
		const test : any[] = userRequested.filter(requested => requested.uuid === uuid);
		if (!test.length)
			return true;
		return false;
	}
	
	function IsRequest(uuid : string) {
		const userRequest : any[] = requestList;
		const request : any[] = userRequest.filter(request => request.uuid === uuid);
		if (!request.length)
			return true;
		return false;
	}

	async function History (uuid : string) {
		await instance.get(`room/getGameOfUser/` + uuid, {
		headers: ({
			Authorization: 'Bearer ' + localStorage.getItem('token'),
		})
		}).then((res) => {
			if (res.data && res.data.length)
			{
				setHistoryList(res.data);
			}
			else
				(setHistoryList([]));
		});
	}

	useEffect (() => {
	if (firstrender.current)
	{
		firstrender.current = false;
		return;
	}
	if (profilePage)
	{
		History(profilePage?.uuid);
		getExp(profilePage?.uuid, setProfileExp);
		firstrender.current = true;
	}
	}), [profilePage];

	return (
		<div className="popup">
		{
			profileDisplayed ?
			(
				<>
					<ClosePopup setProfileDisplayed={setProfileDisplayed} />
					<img className="ProfileImg" src={profilePage?.image} alt="user_img" width="384" height="256"/>
					<h3> {profilePage?.username} </h3>
					<h4> @{profilePage?.trueUsername} </h4>
					<div className="Buttons">
					<BlockOrUnblock UserUuid={""} User={props.User}/>
					{	IsRequested(profilePage?.uuid) ?
						(
							IsRequest(profilePage?.uuid) ? 
							(
								<AddOrRemove UserUuid={""} User={props.User}/>
							)

							:

							(
								<>
									<Accept UserUuid={""} UserImg={undefined} User={props.User}/>
									<Decline UserUuid={""} User={props.User}/>
								</>
							)
	
						)
						:
							<Cancel UserUuid={""} User={props.User}/>
					}
					</div> 
					<div className="expBar">
						<span className="exp"> </span>
						<p>{ProfileExp}</p>
					</div>
					<div id='listGameParent'>
					{
						historyList.length ?
						(
							<div id={historyList.length > 3 ? 'listGameScroll' : 'listGame'}>
							{
								historyList.map((game : any, index : number) => (
									<ul key={index}>
										<li>
											<p id="playerName">
												{game.playerA.name} vs {game.playerB.name}
											</p>
											<p id="playerStatus">
												|&nbsp;&nbsp;{whoWon(profilePage?.uuid, game)}
											</p>
											<p id="playerScore">
												|&nbsp;&nbsp;{game.scoreA < 0 ? (game.scoreA == -42 ? 0 : -game.scoreA) : game.scoreA} - {game.scoreB < 0 ? (game.scoreB == -42 ? 0 : -game.scoreB) : game.scoreB}
											</p>
										</li>
									</ul>
								))
							}
							</div>
						)

						:

						null
					}
					</div>
					
				</>
				
			)

			:

			(
				null
			)
		}
		</div>
	)
}

export default Popup;