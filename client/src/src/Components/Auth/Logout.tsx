import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
	useNavigate,
	useLocation,
} from "react-router-dom";
import instance from "../../API/Instance";
import { getSocketSocial } from "../../Redux/userSlice";
import { createNotification } from "../notif/Notif";

function Logout() {
	let navigate = useNavigate();
	const socketSocial = useSelector(getSocketSocial);

	async function CallLogout() {
		await instance.get(`logout`)
			.then(() => {
				socketSocial?.disconnect();
				localStorage.clear();
				createNotification("success", "User disconnected");
				navigate("/");
			})
			.catch(() => {
				createNotification("error", "couldn't disconnect user");
				navigate("/");
			});
	}
	useEffect(() => {
		CallLogout();
	}, []);
	return null;
}

export default Logout;
