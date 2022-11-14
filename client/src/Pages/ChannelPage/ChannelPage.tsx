import axios from 'axios';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Channels from '../../Components/Channels/Channels';
import NavBar from '../../Components/Nav/NavBar';
import { getLogged, getUser, setLogged, setUser } from '../../Redux/authSlice';
import './ChannelPage.scss';
import "../../Pages/Home/HomePage.scss";
import { createNotification } from '../../Components/notif/Notif';

function ChannelPage() {
	const logged = useSelector(getLogged);
    const user = useSelector(getUser);
    const dispatch = useDispatch();
	const navigate = useNavigate();

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
			return ;
		if (newMode === "dm")
			navigate("/chat/dm")
	}
	return (
		<div className='main'>
		<div className='chatPage'>
			<NavBar />
			<div className='container'>
				<div className='selectChannelOrDm'>
					
					{logged === false ?
						<div className='notLogged'>
							<p>Pending...</p>
						</div>
 					:
					<>
						<button className="selectedButton" onClick={() => handleChangeMode("channels")}>Channels</button>
						<button className="selectedButton" onClick={() => handleChangeMode("dm")}>Private Messages</button>
						<Channels />
					</>
				}
				</div>
			</div>
		</div>
		</div>
	);
}

export default ChannelPage;
