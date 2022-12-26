import React, { useEffect, useRef, useState } from "react";
import "./Leaderboard.scss";
import {Helmet} from "react-helmet";
import NavBar from "../../Components/Nav/NavBar";
import instance from "../../API/Instance";

const Leaderboard = () => {

	const [leaderboard, setLeaderboard] = useState<any[]>([]);
	const dados = [
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	{
		id: 1,
		name: 'Laura',
		image: 'https://cdn-icons-png.flaticon.com/512/186/186037.png',
		level: 16,
		xp: 100,
		coins: 500,
		love: 6,
		beacons: 2,
		resources: 70,
	},
	];

	const setLeaderBoard = () => {
		instance.get('user/Leaderboard').then((res) => {
			console.log("ok", res);
			if (res.data && res.data.Leaderboard)
				setLeaderboard(res.data.Leaderboard);
		});
	};
	useEffect(() => {
		setLeaderBoard();
	}, []);
	return (
		<div className="LeaderboardPage">
			<NavBar/>
		<div className="container">
			<Helmet>
					<meta charSet="utf-8" />
					<title> Leaderboard - transcendence </title>
			</Helmet>
		<div className="topLeadersList">
			{leaderboard.map((user, index) => (
				<div className="leader" key={user.id}>
					{index + 1 <= 3 && (
					<div className="containerImage">
						<img className="image" loading="lazy" src={import.meta.env.VITE_URL_API + ":7000/" + user.image} />
						<div className="crown">
						<svg
							id="crown1"
							fill="#0f74b5"
							data-name="Layer 1"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 100 50"
						>
							<polygon
							className="cls-1"
							points="12.7 50 87.5 50 100 0 75 25 50 0 25.6 25 0 0 12.7 50"
							/>
						</svg>
						</div>
						<div className="leaderName">{user.username}</div>
					</div>
					)}
				</div>
			))}
		</div>

		<div className="playerslist">
			<div className="table">

				<div>#</div>
			
				<div>Name</div>
			
			
				<div>LVL</div>
		
			</div>
			<div className="list">
			{leaderboard.map((user, index) => (
				<div className="player" key={user.id}>
				<span> {index + 1} </span>
				<div className="user">
					<img className="image" src={import.meta.env.VITE_URL_API + ":7000/" + user.image} />
					<span> {user.username} </span>
				</div>
				<span> {user.exp} </span>
				</div>
			))}
			</div>
			</div>
		</div>
		</div>
	);
}

export default Leaderboard;