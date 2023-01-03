
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNotification } from "../../Components/notif/Notif";
import React from "react";
import KillSocket from "../../Components/KillSocket/KillSocket";
import instance from "../../API/Instance";
import { Helmet } from "react-helmet";
import { BsArrowRightCircleFill } from 'react-icons/bs'
import "./TwoAuth.scss";

function TwoAuth() {
	KillSocket("all");
	let navigate = useNavigate();
	let booleffect = false;
	const [print, setPrint] = useState<boolean>();
	const [authCode, setAuthCode] = useState<string>();
	const token = localStorage.getItem("token");

	const [booleffect2, setbooleffect2] = useState<boolean>(true);

	const [User, setUser] = useState<any>();
	const [IsTwoAuthActivated, setActivated] = useState<boolean>(false);
	const [IsTwoAuthConnected, setConnected] = useState<boolean>(false);

	async function GetLoggedInfo() {
		if (localStorage.getItem("token")) {
			await instance.get(`user/getLoggedInfo`, {
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((res) => {
					setActivated(res.data.isTwoFactorAuthenticationEnabled);
					setConnected(res.data.isSecondFactorAuthenticated);
					setbooleffect2(false);
				})
				.catch((err) => {
					console.log(err.message);
					setbooleffect2(false);
				});
		} else {
			createNotification("error", "User not found");
			navigate("/");
		}
	}

	function setOfPrint() {
		console.log(IsTwoAuthActivated);
		if (IsTwoAuthActivated)
			setPrint(true);
		else
			setPrint(false);
	}

	const LogTwoAuth = async (event: any) => {
		event.preventDefault();
		await instance.post(`2fa/authenticate`,
			{ twoFactorAuthenticationCode: authCode },
			{
				headers: {
					Authorization: "Bearer " + token,
				},
			}
		)
			.then((res) => {
				createNotification("success", res.data.message);
				navigate("/");
			})
			.catch((err) => {
				createNotification("error", err.response.data.message);
			});
		if (IsTwoAuthConnected) {
			await instance.get(`user`, {
				headers: {
					Authorization: "Bearer " + token,
				},
			})
				.then((res) => {
					setUser(JSON.stringify(res.data.User));
				});
		}
	};
	useEffect(() => {
		if (!booleffect) {
			GetLoggedInfo();
			booleffect = true;
		}
	}, []);
	useEffect(() => {
		if (!booleffect2)
			setOfPrint();
	}, [IsTwoAuthActivated]);
	return (
		<div className="TwoAuthPage">
			<Helmet>
				<meta charSet="utf-8" />
				<title> Two-Factor Auth - transcendence </title>
			</Helmet>
			{print ? (
				<>
					<h2>
						Enter Google authenticator code
					</h2>
					<div className="Form">
						<form onSubmit={LogTwoAuth}>
							<input
								type="text"
								id="code"
								name="code"
								required
								onChange={(e) => setAuthCode(e.target.value)}
							/>
							<button type="submit"><span><BsArrowRightCircleFill /></span></button>
						</form>
					</div>
				</>
			) : (
				null
			)}
		</div>
	);
}

export default TwoAuth;
