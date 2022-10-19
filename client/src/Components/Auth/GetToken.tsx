import axios from 'axios';
import React from 'react'
import {useRef} from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { redirect, useNavigate, useLocation, useParams } from "react-router-dom"
// import { getLogged, getUser, setLogged, setUser, getActivated, setActivated, getConnected, setConnected } from '../../Redux/authSlice';


function GetToken() {
	let navigate = useNavigate();
	let location = useLocation();
	let booleffect = false;
	// let booleffect2 = true;
	const booleffect2 = useRef<boolean>(true);
	const firstrender = useRef<boolean>(true);
  
	// const IsLoggedIn = useSelector(getLogged);
	// const IsTwoAuthConnected = useSelector(getConnected);
	// const IsTwoAuthActivated = useSelector(getActivated);
	// const User = useSelector(getUser);
	// const dispatch = useDispatch();

	const [User, setUser] = useState<any>();
	const [IsLoggedIn, setLogged] = useState<boolean>();
	const [IsTwoAuthActivated, setActivated] = useState<boolean>(false);
	const [IsTwoAuthConnected, setConnected] = useState<boolean>();

	function GetLoggedInfo()
	{
		if (localStorage.getItem('token'))
		{
			axios.get(`http://45.147.97.2:5000/user/getLoggedInfo`, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
				}).then((res) => {
					setLogged(res.data.IsLoggedIn);
					setActivated(res.data.isTwoFactorAuthenticationEnabled);
					setConnected(res.data.isSecondFactorAuthenticated);
					
				}).catch((err) => {
					console.log(err.message);
					setUser("{}");	
				});
			console.log("ereh");
		}
		console.log("here");
		booleffect2.current = false;
	}
	function redirect() {
		if (IsTwoAuthActivated)
			navigate("/twoauth")
	}

	async function NotActivated() {
		console.log('Bearer ' + localStorage.getItem('token'));
			await axios.get(`http://45.147.97.2:5000/user`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				setUser(JSON.stringify(res.data.User));
				console.log(res.data.message);
				navigate("/");
			}).catch((err) => {
				console.log(err.message);
				//navigate("/");
			});
	}
	function AuthCall () : any {
		const queryParams = new URLSearchParams(window.location.search);
		const code = queryParams.get('code');
		console.log(code);
		axios.get(`http://45.147.97.2:5000/login/42/return/` + code).then((res) => {
			if (res.data)
			{
				localStorage.setItem('token', res.data.token);
				GetLoggedInfo();
				//console.log("heho " + IsTwoAuthActivated);
				// if (IsTwoAuthActivated)
				// 	navigate("/twoauth")
			}
			
		}).catch((err) => {
			console.log(err.message);
			navigate("/");
		});
		// if (!IsTwoAuthActivated)
		// {
		// 	console.log('Bearer ' + localStorage.getItem('token'));
		// 	await axios.get(`http://45.147.97.2:5000/user`, {
		// 		headers: ({
		// 			Authorization: 'Bearer ' + localStorage.getItem('token'),
		// 		})
		// 	}).then((res) => {
		// 		setUser(JSON.stringify(res.data.User));
		// 		console.log(res.data.message)
		// 		navigate("/")
		// 	}).catch((err) => {
		// 		console.log(err.message);	
		// 	});
		// }
	}
	useEffect(() => {
		if (!booleffect)
		{
			//GetLoggedInfo();
			AuthCall();
			booleffect = true;
		}
	}, []);
	useEffect(() => {
		if (firstrender.current)
		{
			firstrender.current = false;
			return;
		}
		if (!booleffect2.current)
		{
			if (IsTwoAuthActivated)
				redirect();
			else
				NotActivated();
		}
	}, [IsTwoAuthActivated, booleffect2.current]);
	return (
		<div>
			<p> Login in process ...</p>
		</div>
	)
	
			
}

export default GetToken;