import axios from 'axios';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Channels from '../../Components/Channels/Channels';
import NavBar from '../../Components/Nav/NavBar';
import { getLogged, getUser, setLogged, setUser } from '../../Redux/authSlice';
import './ChannelPage.scss';
import "../../Pages/Home/HomePage.scss";

function ChannelPage() {
	const logged = useSelector(getLogged);
    const user = useSelector(getUser);
    const dispatch = useDispatch();
	const navigate = useNavigate();

	const setGood = async (e: any) => {
		e.preventDefault();
		if (user?.id !== "")
		{
			const userInfos = (await axios.get("http://90.66.192.148:7000/api/chat/user/" + user.id))?.data;
			if (!userInfos)
				return ;
			dispatch(setUser(userInfos));
			dispatch(setLogged(true));
		}
	}

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
						<div className='login'>
							<h1>Log in</h1>
							<input type="text" placeholder="User id" onChange={(e) => dispatch(setUser({id: e.target.value}))}/>
							<input type="submit" value="Log in" onClick={(e) => setGood(e)}/>
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
