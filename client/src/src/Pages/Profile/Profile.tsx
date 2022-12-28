
import { useEffect, useRef, useState } from "react";
import SignIn from "../../Components/Auth/Signin";
import { redirect, useNavigate, useLocation, useParams } from "react-router-dom";
import { createNotification } from "../../Components/notif/Notif";
import { whoWon } from "../../Components/Utils/whoWon";
import React from "react";
import './Profile.scss';

import "./Profile.scss";
import NavBar from "../../Components/Nav/NavBar";
import KillSocket from "../../Components/KillSocket/KillSocket";
import { getExp, getExpProfile } from "../../Components/Utils/getExp";
import { modifyScores } from "../../Components/Utils/modifyScores";
import instance from "../../API/Instance";
import {Helmet} from "react-helmet";
import { getRanking, setRanking } from "../../Redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import {GiRank3} from "react-icons/gi";
// import { useDispatch, useSelector } from 'react-redux';
// import { getLogged, getUser, setLogged, setUser, getActivated, setActivated, getConnected, setConnected } from '../Redux/authSlice';

function Profile() {
  let navigate = useNavigate();
  let booleffect = false;
  const params = useParams();
  const token = localStorage.getItem("token");
  KillSocket("all");
  const booleffect3 = useRef<boolean>(false);
  const [booleffect2, setbooleffect2] = useState<boolean>(true);
  const firstrender = useRef<boolean>(true);


  const [userProfile, setUserProfile] = useState<any>();
  const [historyList, SetHistoryList] = useState<any[]>([]);
  const [profileExp, setProfileExp] = useState<number>(0.00);

	const dispatch = useDispatch();

	const Rank : number = useSelector(getRanking);


  async function GetUserProfile(username : string) {
    if (localStorage.getItem("token")) {
		await instance.get(`user/SearchProfile/` + username, {
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
					instance.get(`room/getGameOfUser/` + res.data.User.uuid,
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
					instance.get(`user/RankingByUuid/` + res.data.User.uuid).then((res) => {
						if (res.data && res.data.Rank)
							dispatch(setRanking(res.data.Rank));
						console.log("Ranking", res.data)
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
		let username = params.Username;
		if (username)
			GetUserProfile(username);
  }, [params.Username]);

	useEffect((): any => {
		if (userProfile)
			getExpProfile(userProfile.uuid, setProfileExp);
	}, [userProfile]);


  return (
    <div className="profilePage">
	{
		!booleffect2 ? (
			<div className='blur'>
				<Helmet>
					<meta charSet="utf-8" />
					<title> Profile - transcendence </title>
				</Helmet>
				<NavBar/>
				<div id="userProfile">
					<img
					src={import.meta.env.VITE_URL_API + ":7000/" + userProfile.image}
					alt="user_img"
					className="userImg"
					width="384"
					height="256"
					/>
					<div className="Rank">
						<h3> {userProfile?.username} </h3>
						<h4> <GiRank3/>{Rank} </h4>
					</div>
					<h4> @{userProfile?.trueUsername} </h4>
					{profileExp < 5 ?
						<img className="image" src={"../steel.png"} height={38} width={38}/>
					: profileExp < 10 ?
						<img className="image" src={"../bronze.png"} height={38} width={38}/>
					: profileExp < 15 ?
						<img className="image" src={"./silver.png"} height={38} width={38}/>
					: profileExp < 21 ?
						<img className="image" src={"../gold.png"} height={38} width={38}/>
					: profileExp < 22 ?
						<img className="image" src={"../diamond.png"} height={46} width={38}/>
						: <img className="image" src={"../steel.png"} height={38} width={38}/>
					}
					<div className="expBar">
						<span className="Exp"> </span>
						<p>{profileExp}</p>
					</div>
					<div id="listGameParent">
					{
						historyList.length ?
						(
							<div id={historyList.length > 4 ? "listGameScroll" : "listGame"}>
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
									|&nbsp;&nbsp;{game.scoreA < 0 ? (game.scoreA == -42 ? 0 : -game.scoreA) : game.scoreA} - {game.scoreB < 0 ? (game.scoreB == -42 ? 0 : -game.scoreB) : game.scoreB}
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
