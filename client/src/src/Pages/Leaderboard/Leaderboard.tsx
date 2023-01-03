import React, { useEffect, useState } from "react";
import "./Leaderboard.scss";
import { Helmet } from "react-helmet";
import NavBar from "../../Components/Nav/NavBar";
import instance from "../../API/Instance";
import { Link } from "react-router-dom";

const Leaderboard = () => {

	const [leaderboard, setLeaderboard] = useState<any[]>([]);
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
			<NavBar />
			<div className="container">
				<Helmet>
					<meta charSet="utf-8" />
					<title> Leaderboard - transcendence </title>
				</Helmet>
				{leaderboard.length > 2 ?
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
										<h3 className="leaderName">{user.username}</h3>
									</div>
								)}
							</div>
						))}
					</div>
					: null}

				<div className="playersList">
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
									{user.exp < 5 ?
										<img className="image" src={"./steel.png"} height={28} width={28} />
										: user.exp < 10 ?
											<img className="image" src={"./bronze.png"} height={28} width={28} />
											: user.exp < 15 ?
												<img className="image" src={"./silver.png"} height={28} width={28} />
												: user.exp < 21 ?
													<img className="image" src={"./gold.png"} height={28} width={28} />
													: user.exp < 22 ?
														<img className="image" src={"./diamond.png"} height={36} width={28} />
														: <img className="image" src={import.meta.env.VITE_URL_API + ":7000/" + user.image} height={28} width={28} />
									}
									<Link to={"/profile/" + user.trueUsername}> {user.username} </Link>
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