import React from "react"
import { getBlockList, getFriendList, getHistoryList, getProfileDisplayed, getProfilePage, getRequestedList, getRequestList, getSocketSocial, setBlockList, setFriendList, setHistoryList, setProfileDisplayed, setProfilePage, setRequestedList, setRequestList } from "../../../Redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

interface props {
	UserUuid : string;
}

function Show(props : props) {
	let navigate = useNavigate();
	const dispatch = useDispatch();
	async function ShowProfile(uuid : string)
	{
		await axios.get(`http://90.66.199.176:7000/user/findUser/` + uuid, {
		headers: ({
			Authorization: 'Bearer ' + localStorage.getItem('token'),
		})
		}).then((res) => {
			if (res && res.data)
			{
				// if (location.pathname[location.pathname.length - 1] == '/')
				// 	navigate(location.pathname + uuid);
				// else
				// 	navigate(location.pathname + '/' + uuid);
				dispatch(setProfilePage(res.data.User));
				dispatch(setProfileDisplayed(true));
				let blur = document.getElementsByClassName('blur');
				for (let i = 0; i < blur.length ; i++)
					blur[i]?.classList.toggle('active');
				let popup = document.getElementsByClassName('popup');
				for (let i = 0; i < popup.length ; i++)
					popup[i]?.classList.toggle('active');
			}
			else
				dispatch(setProfilePage([]));
		}).catch((err) => {
			console.log(err);
			navigate(location.pathname);
		});
	}

	return (
		<button onClick={() => (ShowProfile(props?.UserUuid))} > <FaUserCircle/> </button>
	);
}

export default Show;