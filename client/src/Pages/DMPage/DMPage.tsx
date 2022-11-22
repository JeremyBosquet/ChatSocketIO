import axios from 'axios';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import KillSocket from '../../Components/KillSocket/KillSocket';
import { createNotification } from '../../Components/notif/Notif';
import PrivateMessages from '../../Components/PrivateMessages/PrivateMessages';
import { getLogged, getUser, setLogged, setUser } from '../../Redux/authSlice';
import { getMode } from '../../Redux/chatSlice';
import './DMPage.scss'

function DMPage() {
	const logged = useSelector(getLogged);
    const mode = useSelector(getMode);
    const user = useSelector(getUser);
    const dispatch = useDispatch();
	const navigate = useNavigate();


	KillSocket("spectate");
	KillSocket("game");

	useEffect(() => {
		const getUserInfos = async () => {
			await axios
			.get(`http://90.66.192.148:7000/user`, {
			  headers: {
				Authorization: "Bearer " + localStorage.getItem("token"),
			  },
			})
			.then((res) => {
			  dispatch(setUser(res.data.User));
			  dispatch(setLogged(true));
			})
			.catch((err) => {
			  setUser({});
			  createNotification("error", "User not found");
			  navigate("/");
			});
		}

		if (localStorage.getItem("token"))
			getUserInfos();
	}, []);

	const handleChangeMode = (newMode: string) => {
		if (newMode === "channels")
			navigate("/chat/channel")
		if (newMode === "dm")
			return ;
	}
	return (
		<div className='chatPage'>
			<div className='container'>
				<div className='selectChannelOrDm'>
					
					{logged === false ?
						<div className='notLogged'>
							<p>Pending...</p>
						</div>
 					:
					<>
						<button className={mode === "channel" ? "selectedButton" : null + ' selectButton'} onClick={() => handleChangeMode("channels")}>Channels</button>
						<button className={mode === "dm" ? "selectedButton" : null + ' selectButton'} onClick={() => handleChangeMode("dm")}>Private Messages</button>
						<PrivateMessages />
					</>
				}
				</div>
			</div>
		</div>
	);
}

export default DMPage;
