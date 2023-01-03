
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import KillSocket from "../../Components/KillSocket/KillSocket";
import './NotFound.scss'
import instance from "../../API/Instance";
import { Helmet } from "react-helmet";

function NotFound() {
	let navigate = useNavigate();
	KillSocket("all");
	let booleffect = false;


	const [User, setUser] = useState<any>();
	const [IsTwoAuthActivated, setActivated] = useState<boolean>();
	const [IsTwoAuthConnected, setConnected] = useState<boolean>();

	async function GetLoggedInfoAndUser() {
		if (localStorage.getItem("token")) {
			await instance.get(`user/getLoggedInfo`, {
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((res) => {
					setActivated(res.data.isTwoFactorAuthenticationEnabled);
					setConnected(res.data.isSecondFactorAuthenticated);
				})
				.catch((err) => {
					console.log(err.message);
				});
			await instance.get(`user`, {
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((res) => {
					setUser(JSON.stringify(res.data.User));
					console.log(User);
				})
				.catch((err) => {
					console.log(err.message);
				});
		}
	}

	useEffect(() => {
		if (!booleffect) {
			GetLoggedInfoAndUser();
			booleffect = true;
		}
	}, []);

	return (
		<div className="NotFoundPage">
			<Helmet>
				<meta charSet="utf-8" />
				<title> 404 - transcendence </title>
			</Helmet>
			<img src={"/404.png"} alt="404"></img>
			<button onClick={() => navigate("/")}> Home </button>
		</div>
	);
}

export default NotFound;
