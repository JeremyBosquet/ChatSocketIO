import axios from 'axios';
import React from 'react';
import { useEffect, useState } from 'react';
import { redirect, useNavigate, useLocation, useParams } from "react-router-dom"
import { createNotification } from '../notif/Notif';

function Logout() {
	let navigate = useNavigate();
	let location = useLocation();
	let booleffect = false;
  
	// const IsLoggedIn = useSelector(getLogged);
	// const IsTwoAuthConnected = useSelector(getConnected);
	// const IsTwoAuthActivated = useSelector(getActivated);
	// const User = useSelector(getUser);
	// const dispatch = useDispatch();

	const [User, setUser] = useState<any>();
	const [IsLoggedIn, setLogged] = useState<boolean>();
	const [IsTwoAuthActivated, setActivated] = useState<boolean>();
	const [IsTwoAuthConnected, setConnected] = useState<boolean>();

	async function GetLoggedInfo()
	{
		if (localStorage.getItem('token'))
		{
			await axios.get(`http://90.66.192.148:7000/user/getLoggedInfo`, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
				}).then((res) => {
					setLogged(res.data.IsLoggedIn);
					setActivated(res.data.isTwoFactorAuthenticationEnabled);
					setConnected(res.data.isSecondFactorAuthenticated);
				}).catch((err) => {
					console.log(err.message);
					setLogged(false);
				});
		}
	}

	async function CallLogout () {
		const token = localStorage.getItem('token');
			await axios.get(`http://90.66.192.148:7000/logout`, {
				headers: ({
					Authorization: 'Bearer ' + token
				})
			}).then((res) => {
				GetLoggedInfo();
				setUser("{}");
				localStorage.clear();
				createNotification('success', 'User disconnected');
				navigate("/");
			}).catch((err) => {
				createNotification('error', "couldn't disconnect user");
				navigate("/");
			});
	}
	useEffect(() => {
		if (!booleffect)
		{
			GetLoggedInfo();
			CallLogout()
			booleffect = true;
		}
	},[]);
	return (
		<div>
		</div>
	)
	
			
}

export default Logout;