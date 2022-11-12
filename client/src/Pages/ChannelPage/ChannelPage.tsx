import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Channels from '../../Components/Channels/Channels';
import { getLogged, getUser, setLogged, setUser } from '../../Redux/authSlice';
import { getMode, setMode, setSocket } from '../../Redux/chatSlice';
import './ChatPage.scss'

function ChannelPage() {
	const logged = useSelector(getLogged);
    const mode = useSelector(getMode);
    const user = useSelector(getUser);
    const dispatch = useDispatch();
	const navigate = useNavigate();
	
	useEffect(() => { // Connect to the socket
		const newSocket = io('http://localhost:4001');
		dispatch(setSocket(newSocket));
		newSocket.on('connect', () => {
			newSocket.emit("connected", {userId: user.id});
		});
		//eslint-disable-next-line
	}, []);

	// const changeMode = (newMode: string) => {
	// 	if (newMode === mode)
	// 		return ;
	// 	else
	// 		setMode(newMode);
	// }

	const setGood = async (e: any) => {
		e.preventDefault();
		if (user?.id !== "")
		{
			const userInfos = (await axios.get("http://localhost:4000/api/chat/user/" + user.id))?.data;
			if (!userInfos)
				return ;
			dispatch(setUser(userInfos));
			dispatch(setLogged(true));
		}
	}

	const handleChangeMode = (newMode: string) => {
		if ((mode === "channels" && newMode === "channels") || (mode === "dm" && newMode === "dm"))
			return ;
		if (newMode === "channels")
			navigate("/chat/channel")
		if (newMode === "dm")
			navigate("/chat/dm")
		dispatch(setMode(newMode));
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
						<Channels />
					</>
				}
				</div>
			</div>
		</div>
	);
}

export default ChannelPage;
