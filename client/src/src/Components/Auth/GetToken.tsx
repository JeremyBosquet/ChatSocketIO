import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import instance from "../../API/Instance";
import { getSocketSocial, setSocketSocial, setUser } from "../../Redux/userSlice";
import { createNotification } from "../notif/Notif";

function GetToken() {
	let navigate = useNavigate();
	let booleffect = false;
	
	const [IsTwoAuthActivated, setActivated] = useState<boolean>(false);
	const [connected, setConnected] = useState<boolean>(false);
	const [booleffect3, setBooleffect3] = useState<number>(0);
	const [firstrender, setFirstRender] = useState<boolean>(false);

	const dispatch = useDispatch();
	const socketSocial = useSelector(getSocketSocial);

	async function GetLoggedInfo() {
		if (localStorage.getItem("token")) {
			await instance.get(`user/getLoggedInfo`)
				.then((res) => {
					setActivated(res.data.isTwoFactorAuthenticationEnabled);
					setConnected(res.data.isSecondFactorAuthenticated);
					setBooleffect3(2);
				})
				.catch((err) => {
					setBooleffect3(-1);
					setBooleffect3(-2);
				});
		}
		if (!firstrender)
			setFirstRender(true)
	}
	const userSet = async () => {
		await instance.get(`user`)
			.then((res) => {
				if (res.data.User) {
					if (!socketSocial)
					{
						socketSocial?.close();
						const newSocketSocial = io(import.meta.env.VITE_URL_API + ':7003');
						newSocketSocial?.emit("connected", { uuid: res.data.User.uuid });
						dispatch(setSocketSocial(newSocketSocial));
					}
				}
			});
		navigate("/");
	}
	async function AuthCall() {
		const queryParams = new URLSearchParams(window.location.search);
		const code = queryParams.get("code");
		await instance.get(`login/42/return/` + code)
			.then((res) => {
				if (res.data) {
					localStorage.setItem("token", res.data.token);
					GetLoggedInfo();
				}
			})
			.catch((err) => {
				navigate("/");
			});
	}
	useEffect(() => {
		if (!firstrender)
			AuthCall();
	}, []);
	useEffect(() => {
		if (booleffect3 > 0) {
			if (IsTwoAuthActivated)
				navigate("/twoauth");
			else
				userSet();
		}
		else
			GetLoggedInfo();
	}, [booleffect3]);
	return (
		<div>
			<p> Login in process ...</p>
		</div>
	);
}

export default GetToken;
