import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getBlockList, getFriendList, getHistoryList, getProfileDisplayed, getProfilePage, getRequestedList, getRequestList, getSocketSocial, setBlockList, setFriendList, setRequestedList, setRequestList } from "../../Redux/authSlice";
import { setProfileDisplayed} from '../../Redux/authSlice'
import { whoWon } from "../Utils/whoWon";
import ClosePopup from "./ClosePopup/ClosePopup";
import BlockOrUnblock from "./BlockOrUnblock/BlockOrUnbloc";
import AddOrRemove from "./AddOrRemove/AddOrRemove";
import Accept from "./Accept/Accept";
import Decline from "./Decline/Decline";
import Cancel from "./Cancel/Cancel";
import {getExp} from '../../Components/Utils/getExp'

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
	const historyList = useSelector(getHistoryList);

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

	useEffect (() => {
	if (firstrender.current)
	{
		firstrender.current = false;
		return;
	}
	if (profilePage)
	{
		getExp(profilePage?.uuid, setProfileExp);
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
					<div className="Buttons">
					<BlockOrUnblock profilePage={profilePage} User={props.User}/>
					{	IsRequested(profilePage?.uuid) ?
						(
							IsRequest(profilePage?.uuid) ? 
							(
								<AddOrRemove profilePage={profilePage} User={props.User}/>
							)

							:

							(
								<>
									<Accept profilePage={profilePage} User={props.User}/>
									<Decline profilePage={profilePage} User={props.User}/>
								</>
							)
	
						)
						:
							<Cancel profilePage={profilePage} User={props.User}/>
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
									<ul key={index} >
										{whoWon(profilePage.uuid, game.playerA, game.playerB, game.status) === 'Victory' ? 
										
											<li> <span className='green'> {game.playerA.name} vs {game.playerB.name} / {whoWon(profilePage.uuid, game.playerA, game.playerB, game.status)}</span> </li>

											:

											<li> <span className='red'> {game.playerA.name} vs {game.playerB.name} / {whoWon(profilePage.uuid, game.playerA, game.playerB, game.status)}</span> </li>
											
										}
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