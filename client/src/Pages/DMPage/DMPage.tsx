import axios from 'axios';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
			navigate("/chat/channel")
		if (newMode === "dm")
			return ;
	}
	return (
		<div className='chatPage'>
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
