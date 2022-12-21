import axios from "axios";
import { useEffect, useRef, useState } from "react";
import SignIn from "../../Components/Auth/Signin";
import { redirect, useNavigate, useLocation } from "react-router-dom";
import { createNotification } from "../../Components/notif/Notif";
import { whoWon } from "../../Components/Utils/whoWon";
import React from "react";
import './Profile.scss';

import "./Profile.scss";
import NavBar from "../../Components/Nav/NavBar";
import KillSocket from "../../Components/KillSocket/KillSocket";
import { getExp, getExpProfile } from "../../Components/Utils/getExp";
import { modifyScores } from "../../Components/Utils/modifyScores";
// import { useDispatch, useSelector } from 'react-redux';
// import { getLogged, getUser, setLogged, setUser, getActivated, setActivated, getConnected, setConnected } from '../Redux/authSlice';

function Profile() {
  let navigate = useNavigate();
  let booleffect = false;
  const token = localStorage.getItem("token");
  KillSocket("all");
  const booleffect3 = useRef<boolean>(false);
  const [booleffect2, setbooleffect2] = useState<boolean>(true);
  const firstrender = useRef<boolean>(true);


  const [userProfile, setUserProfile] = useState<any>();
  const [historyList, SetHistoryList] = useState<any[]>([]);
  const [profileExp, setProfileExp] = useState<any>(0.00);

  const [scoreA, setScoreA] = useState<number[]>([]);
	const [scoreB, setScoreB] = useState<number[]>([]);


  async function GetUserProfile(username : string) {
    if (localStorage.getItem("token")) {
		await axios.get(`http://90.66.199.176:7000/user/SearchProfile/` + username, {
			headers: ({
				Authorization: 'Bearer ' + localStorage.getItem('token'),
			})
			}).then((res) => {
				if (res.data && res.data.User)
				{
					// if (location.pathname[location.pathname.length - 1] == '/')
					// 	navigate(location.pathname + uuid);
					// else
					// 	navigate(location.pathname + '/' + uuid);
					setUserProfile(res.data.User);
					axios.get(`http://90.66.199.176:7000/api/room/getGameOfUser/` + res.data.User.uuid,
					{
						headers: {
						Authorization: "Bearer " + token,
						},
					}).then((res) => {
						if (res.data && res.data.length)
							SetHistoryList(res.data);
						else if (res.data)
							SetHistoryList([]);
					});
				}
				else
					navigate('/');
			}).catch((err) => {
				console.log(err)
				navigate('/');
			});
    }
    setbooleffect2(false);
  }
  useEffect((): any => {
    if (!booleffect) {
		let username = location.pathname.split('/')[2];
		GetUserProfile(username);
      booleffect = true;
    }
  }, []);

	useEffect((): any => {
		if (userProfile)
			getExpProfile(userProfile.uuid, setProfileExp);
	}, [userProfile]);


  return (
    <div className="profilePage">
	{
		!booleffect2 ? (
			<div className='blur'>
				<NavBar/>
				<div id="userProfile">
					<img
					src={userProfile.image}
					alt="user_img"
					className="userImg"
					width="384"
					height="256"
					/>
					<h3> {userProfile?.username} </h3>
					<h4> @{userProfile?.trueUsername} </h4>
					<div className="expBar">
						<span className="Exp"> </span>
						<p>{profileExp}</p>
					</div>
					<div id="listMyGameParent">
					{
						historyList.length ?
						(
							<div id={historyList.length > 4 ? "listMyGameScroll" : "listMyGame"}>
							{historyList.map((game, index) => (
								<ul key={index}>
									<li>
									<p id="playerName">
										{game.playerA.name} vs {game.playerB.name}
									</p>
									<p id="playerStatus">
										|&nbsp;&nbsp;{whoWon(userProfile.uuid, game)}
									</p>
									<p id="playerScore">
									|&nbsp;&nbsp;{game.scoreA < 0 ? -game.scoreA : game.scoreA} - {game.scoreB < 0 ? -game.scoreB : game.scoreB}
									</p>
									</li>
								</ul>
							))}
							</div>
						)
						: null
					}
					</div>
				</div>
			</div>
			)
			: 
				null
	}
    </div>
  );
}

export default Profile;
