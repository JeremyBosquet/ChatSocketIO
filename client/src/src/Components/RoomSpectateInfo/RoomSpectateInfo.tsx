import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import './RoomSpectateInfo.scss'
import { useSelector } from "react-redux";
import { getSockeSpectate } from "../../Redux/gameSlice";
import { IRoom, ISettings } from "../GamePlay/Interfarces/GameInterace";


interface props {
	id: string;
	name: string;
	owner: string;
	nbPlayers: number;
	status: string;
	createdAt: string;
	settings: ISettings;
	lastActivity: number;
	playerAName: string;
	playerBName: string;
	scoreA: number;
	scoreB: number;
	playerAId: string;
	playerBId: string;
}

let random = Math.random() * 1000;
random = Math.floor(random);
function RoomSpectateInfo(props: props) {
	const socket = useSelector(getSockeSpectate);
	const [scoreA, setScoreA] = useState<number>(props.scoreA);
	const [scoreB, setScoreB] = useState<number>(props.scoreB);
	const navigate = useNavigate();
	useEffect(() => {
		random = Math.random() * 1000;
		random = Math.floor(random);
	}, []);
	function joinRoom(id: string) {
		navigate(`/game/spectate/${id}`);
	}

	socket?.on("roomUpdated-" + props.id, (data: IRoom) => {
		if (data) {
			setScoreA(data.scoreA);
			setScoreB(data.scoreB);
		}
	});
	return (
		<>

			<div className='roomInfo'>
				<div key={props.id} className="room" onClick={() => joinRoom(props.id)}>
					<div className="roomInfoName">
						<div className="roomUserInfos">
							<img src={import.meta.env.VITE_URL_API + ":7000/api/user/getProfilePicture/" + props.playerAId  + "#" + random} className="roomInfoUserImage" />
							<p>{props.playerAName}</p>
						</div>
						<div className="roomInfoScore">
							<p>{scoreA} - {scoreB}</p>
						</div>
						<div className="roomUserInfos">
							<p>{props.playerBName}</p>
							<img src={import.meta.env.VITE_URL_API + ":7000/api/user/getProfilePicture/" + props.playerBId  + "#" + random} className="roomInfoUserImage" />
						</div>
					</div>

				</div>
			</div>
		</>
	);
}

export default RoomSpectateInfo;
