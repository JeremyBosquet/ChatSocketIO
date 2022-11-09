import axios from 'axios';
import io, { Socket } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom"
import { createNotification } from '../../Components/notif/Notif';
// import { useDispatch, useSelector } from 'react-redux';
// import { getLogged, getUser, setLogged, setUser, getActivated, setActivated, getConnected, setConnected } from '../Redux/authSlice';
import './HomePage.scss';
import { FaUserCircle, FaUserFriends } from 'react-icons/fa';
import {IoMdSettings}  from 'react-icons/io';
import {IoLogOutSharp}  from 'react-icons/io5';
import {IoGameController}  from 'react-icons/io5';
import {BsFillEyeFill}  from 'react-icons/bs';
import React from 'react';
import NavBar from '../../Components/Nav/NavBar';



function HomePage() {
	let navigate = useNavigate();
	let tab: any[] = [];
	const nbButton : number = 6;
	const [compt, setCompt] = useState<number>(0);
	//const [user, setUser] = useState<any>();
	const booleffect = useRef<boolean>(false);
	const [booleffect2, setbooleffect2] = useState<boolean>(true);
	const firstrender = useRef<boolean>(true);
	const [socket, setSocket] = useState<Socket>();

	const [checkedProfile, setCheckedProfile] = useState<boolean>(false);
	const [checkedSettings, setCheckedSettings] = useState<boolean>(false);
	const [checkedLogout, setCheckedLogout] = useState<boolean>(false);
	const [checkedGame, setCheckedGame] = useState<boolean>(false);
	const [checkedSpectate, setCheckedSpectate] = useState<boolean>(false);
	const [checkedSocial, setCheckedSocial] = useState<boolean>(false);
	const [User, setUser] = useState<any>();
	const [friendRequest, setFriendRequest] = useState<number>();


	function activeorDisable(nb : number)
	{
		switch (nb)
		{
			case 0:
				if (checkedProfile)
					setCheckedProfile(false)
				else
				{
					setCheckedSettings(false);
					setCheckedLogout(false);
					setCheckedGame(false);
					setCheckedSpectate(false)
					setCheckedSocial(false);
					setCheckedProfile(true);
				}
				navigate('/profile');
				break;
			case 1:
				if (checkedSettings)
					setCheckedSettings(false)
				else
				{
					setCheckedLogout(false);
					setCheckedGame(false);
					setCheckedSpectate(false)
					setCheckedSocial(false);
					setCheckedProfile(false);
					setCheckedSettings(true);
				}
				navigate('/settings');
				break;
			case 2:
				if (checkedLogout)
					setCheckedLogout(false)
				else
				{
					setCheckedSettings(false);
					setCheckedGame(false);
					setCheckedSpectate(false)
					setCheckedSocial(false);
					setCheckedProfile(false);
					setCheckedLogout(true);
				}
				navigate('/logout')
				break;
			case 3:
				if (checkedGame)
					setCheckedGame(false)
				else
				{
					setCheckedSettings(false);
					setCheckedLogout(false);
					setCheckedSpectate(false)
					setCheckedSocial(false);
					setCheckedProfile(false);
					setCheckedGame(true);
				}
				navigate('/game');
				break;
			case 4:
				if (checkedSpectate)
					setCheckedSpectate(false)
				else
				{
					setCheckedSettings(false);
					setCheckedLogout(false);
					setCheckedGame(false);
					setCheckedSocial(false);
					setCheckedProfile(false);
					setCheckedSpectate(true)
				}
				navigate("/game/spectate");
				break;
			case 5:
				if (checkedSocial)
					setCheckedSocial(false)
				else
				{
					setCheckedSettings(false);
					setCheckedLogout(false);
					setCheckedGame(false);
					setCheckedSpectate(false)
					setCheckedProfile(false);
					setCheckedSocial(true);
				}
				navigate("/social");
				break;
			default :
				break;
		}
	}
	useEffect(() => { // Connect to the socket
		const newSocket = io('http://90.66.192.148:7003');
		setSocket(newSocket);
	}, []);

	useEffect(() => {
		if (socket) {
			socket.removeAllListeners();
			socket.on("newFriend", (data: any) => {
				if (data.uuid === User.uuid && data?.username) {
					createNotification("info", "New friend request from: " + data.username);
				}
				axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
				}).then((res) => {
					tab = res.data.ListFriendsRequest;
					if (tab.length) {
						setFriendRequest(tab.length);
						//createNotification('success', "You have a new friend request");
					}
					else
						setFriendRequest(0);
					setCompt(tab.length);
				}).catch((err) => {
					console.log(err.message);
					setFriendRequest(0);
				});
			});
			socket.on("FriendAccepted", (data: any) => {
				if (data.uuid === User.uuid && data?.username) {
					createNotification("info", data.username + " accepted your friend request");
				}
				axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
				}).then((res) => {
					tab = res.data.ListFriendsRequest;
					if (tab.length) {
						setFriendRequest(tab.length);
					}
					else
						setFriendRequest(0);
					setCompt(tab.length);
				}).catch((err) => {
					console.log(err.message);
					setFriendRequest(0);
				});
			});
			socket.on("CancelFriend", (data: any) => {
				axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
				}).then((res) => {
					tab = res.data.ListFriendsRequest;
					if (tab.length) {
						setFriendRequest(tab.length);
						//createNotification('success', "You have a new friend request");
					}
					else
						setFriendRequest(0);
					setCompt(tab.length);
				}).catch((err) => {
					console.log(err.message);
					setFriendRequest(0);
				});
			});
		}
	}, [socket, User]);

	async function GetLoggedInfoAndUser() {
		if (localStorage.getItem('token')) {
			await axios.get(`http://90.66.192.148:7000/user/getLoggedInfo`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				// setLogged(res.data.IsLoggedIn);
				// setActivated(res.data.isTwoFactorAuthenticationEnabled);
				// setConnected(res.data.isSecondFactorAuthenticated);
			}).catch((err) => {
				console.log(err.message);
				setUser(undefined);
			});
			await axios.get(`http://90.66.192.148:7000/user`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				setUser(res.data.User);
			}).catch((err) => {
				console.log(err.message);
				setUser(undefined);
			});
			await axios.get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
				headers: ({
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				})
			}).then((res) => {
				tab = res.data.ListFriendsRequest;
				if (tab.length) {
					setFriendRequest(tab.length);
				}
				else
					setFriendRequest(0);
				setCompt(tab.length);
			}).catch((err) => {
				console.log(err.message);
				setFriendRequest(0);
			});
		}
		setbooleffect2(false);
	}

	useEffect(() => {
		if (!booleffect.current) {
			GetLoggedInfoAndUser();
			booleffect.current = true;
		}
	}, []);

	return (
		<div className='HomePage'>
		{
			!(booleffect2) ?
			(
				<div>
				{
					(!User) ?
					(
						<div>
							<button id='login' onClick={() => navigate("/login")}> login </button>
						</div>
					)

					:

					(
						<NavBar socket={socket} setSocket={setSocket} />
					)
				}
				</div>
			)

			:

				null
		}
		</div>
	)
}

export default HomePage;