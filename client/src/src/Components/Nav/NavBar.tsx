
import React from "react";
import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { FaUserFriends } from "react-icons/fa";
import { IoMdChatbubbles, IoMdSettings } from "react-icons/io";
import { IoLogOutSharp } from "react-icons/io5";
import { BsFillEyeFill } from "react-icons/bs";
import { AiOutlineClose, AiFillTrophy } from "react-icons/ai";
import './NavBar.scss';
import Social from "../Social/Social";
import { useDispatch, useSelector } from "react-redux";
import { getSockeGame, getSockeGameChat, getSockeSpectate, setSocketGame, setSocketGameChat, setSocketSpectate } from "../../Redux/gameSlice";
import Settings from "../Settings/Settings";

function NavBar() {
	let location = useLocation();
	const [socialOpened, setSocialOpened] = useState<boolean>(false);
	const [settingsOpened, setSettingsOpened] = useState<boolean>(false);
	const [socialHasOpened, setSocialHasOpened] = useState<boolean>(false);
	const [settingsHasOpened, setSettingsHasOpened] = useState<boolean>(false);
	const socketGame = useSelector(getSockeGame);
	const socketSpectate = useSelector(getSockeSpectate);
	const socketChatGame = useSelector(getSockeGameChat);
	const dispatch = useDispatch();

	function openSocial() {
		if (!socialHasOpened)
			setSocialHasOpened(true);
		if (socialOpened)
			setSocialOpened(false);
		else
			setSocialOpened(true);
		if (settingsOpened) {
			const openOrClose = document.getElementById("mySidenavSettings");
			openOrClose?.classList.toggle("active");
			const revealOrHide = document.getElementById("navButtons");
			revealOrHide?.classList.toggle("hidden");
			setSettingsOpened(false);
		}
		const openOrClose = document.getElementById("mySidenavSocial");
		openOrClose?.classList.toggle("active");
		const revealOrHide = document.getElementById("navButtons");
		revealOrHide?.classList.toggle("hidden");
	}

	function openSettings() {
		if (!settingsHasOpened)
			setSettingsHasOpened(true);
		if (settingsOpened)
			setSettingsOpened(false);
		else
			setSettingsOpened(true);
		if (socialOpened) {
			const openOrClose = document.getElementById("mySidenavSocial");
			openOrClose?.classList.toggle("active");
			const revealOrHide = document.getElementById("navButtons");
			revealOrHide?.classList.toggle("hidden");
			setSocialOpened(false);
		}
		const openOrClose = document.getElementById("mySidenavSettings");
		openOrClose?.classList.toggle("active");
		const revealOrHide = document.getElementById("navButtons");
		revealOrHide?.classList.toggle("hidden");
	}


	function closeSocketGame() {
		if (socketGame)
			socketGame.disconnect();
		dispatch(setSocketGame(null));
	}
	function closeSocketSpectate() {
		if (socketSpectate)
			socketSpectate.disconnect();
		dispatch(setSocketSpectate(null));
	}
	function closeSocketChatGame() {
		if (socketChatGame)
			socketChatGame.disconnect();
		dispatch(setSocketGameChat(null));
	}
	const handleClickNav = (pathname: string) => {
		if (!location.pathname.startsWith(pathname) && pathname == "/game")
			closeSocketGame();
		if (!location.pathname.startsWith(pathname) && pathname == "/game/spectate")
			closeSocketSpectate();
		if (!location.pathname.startsWith(pathname) && pathname == "/chat")
			closeSocketChatGame();
	}

	return (
		<div className="NavBar">
			<div id='ProjectName'>
				<NavLink to="/" id='home'>
					Ft_transcendence
				</NavLink>
			</div>
			<>
				<div id="navButtons">
					<NavLink to="/chat" id="chat" className="click" onClick={() => handleClickNav("/chat")}>
						<IoMdChatbubbles className="icon" />
					</NavLink>

					<NavLink to="/game/spectate" id="spectate" className="click" onClick={() => handleClickNav("/game/spectate")}>
						<BsFillEyeFill className="icon" />
					</NavLink>

					<NavLink to="/leaderboard" id="leaderboard" className="click">
						<AiFillTrophy className="icon" />
					</NavLink>

					<button title="Social" id="social" className="click" onClick={() => { openSocial() }}>
						<FaUserFriends className="icon" />
					</button>

					<button title="Settings" id="settings" className="click" onClick={() => { openSettings() }}>
						<IoMdSettings className="icon" />
					</button>

					<NavLink to="/logout" id="logout" className="click">
						<IoLogOutSharp className="icon" />
					</NavLink>
				</div>
				<div id="mySidenavSocial" className="sidenavSocial">
					<button className="closebtn" onClick={() => openSocial()}>
						<span>
							<AiOutlineClose />
						</span>
					</button>
					{socialHasOpened ? <Social /> : null}
				</div>
				<div id="mySidenavSettings" className="sidenavSettings">
					<button className="closebtn" onClick={() => openSettings()}>
						<span>
							<AiOutlineClose />
						</span>
					</button>
					{settingsHasOpened ? <Settings /> : null}
				</div>
			</>
		</div>
	);
}

export default NavBar;
