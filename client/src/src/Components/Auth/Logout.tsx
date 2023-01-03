import { useEffect } from "react";
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
	let location = useLocation();
	let booleffect = false;

	const socketSocial = useSelector(getSocketSocial);

	async function GetLoggedInfo() {
		await instance.get(`user`, {
			headers: {
				Authorization: "Bearer " + localStorage.getItem("token"),
			},
		})
			.then((res) => {
				if (res.data.User)
				{
					socketSocial?.disconnect();
					localStorage.clear();
					navigate("/");
					createNotification("success", "User disconnected");
				}
			}).catch(() => {
			});
	}

	async function CallLogout() {
		await instance.get(`logout`)
			.then(() => {
				GetLoggedInfo();
			})
			.catch(() => {
				createNotification("error", "couldn't disconnect user");
				navigate("/");
			});
	}
	useEffect(() => {
		if (!booleffect) {
			CallLogout();
			booleffect = true;
		}
	}, []);
	return null;
}

export default Logout;
