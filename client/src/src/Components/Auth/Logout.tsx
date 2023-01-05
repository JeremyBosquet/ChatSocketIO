import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	useNavigate,
	useLocation,
} from "react-router-dom";
import instance from "../../API/Instance";
import { getSocketSocial, setUser } from "../../Redux/userSlice";
import { createNotification } from "../notif/Notif";

function Logout() {
	let navigate = useNavigate();
	const socketSocial = useSelector(getSocketSocial);
	const dispatch = useDispatch();

	async function CallLogout() {
		await instance.get(`logout`)
			.then(() => {
				socketSocial?.disconnect();
				localStorage.clear();
				dispatch(setUser(undefined))
				createNotification("success", "You have been disconnected");
				navigate("/");
			})
			.catch(() => {
				createNotification("error", "couldn't disconnect");
				navigate("/");
			});
	}
	useEffect(() => {
		CallLogout();
	}, []);
	return null;
}

export default Logout;
