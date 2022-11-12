// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { io } from 'socket.io-client';
// import Channels from '../../Components/Channels/Channels';
// import PrivateMessages from '../../Components/PrivateMessages/PrivateMessages';
// import { getLogged, getUser, setLogged, setUser } from '../../Redux/authSlice';
// import { getMode, setMode, setSelectedChannelDM, setSocket } from '../../Redux/chatSlice';
// // import { getMode, setMode, setSelectedChannel, setSelectedChannelDM, setSocket } from '../../Redux/chatSlice';
// import './ChatPage.scss'

// function ChatPage() {
// 	// const [socket, setSocket] = useState<Socket>();
//     const mode = useSelector(getMode);
//     const logged = useSelector(getLogged);
//     const user = useSelector(getUser);
//     const dispatch = useDispatch();

// 	useEffect(() => { // Connect to the socket
// 		if (logged)
// 		{
// 			const newSocket = io('http://localhost:4001');
// 			dispatch(setSocket(newSocket));
// 			newSocket.on('connect', () => {
// 				newSocket.emit("connected", {userId: user.id});
// 			});
// 		}
// 		//eslint-disable-next-line
// 	}, [logged]);

// 	const changeMode = (newMode: string) => {
// 		if (newMode === mode)
// 			return ;
// 		else
// 			setMode(newMode);
// 	}

// 	const setGood = async (e: any) => {
// 		e.preventDefault();
// 		if (user?.id !== "")
// 		{
// 			const userInfos = (await axios.get("http://localhost:4000/api/chat/user/" + user.id))?.data;
// 			if (!userInfos)
// 				return ;
// 			dispatch(setUser(userInfos));
// 			dispatch(setLogged(true));
// 		}
// 	}

// 	const handleChangeMode = (newMode: string) => {
// 		if ((mode === "channels" && newMode === "channels") || (mode === "dm" && newMode === "dm"))
// 			return ;
// 		if (newMode === "channels")
// 			dispatch(setSelectedChannelDM(""));
// 		if (newMode === "dm")
// 			dispatch(setSelectedChannel(""));
// 		dispatch(setMode(newMode));
// 	}
// 	return (
// 		<div className='chatPage'>
// 			<div className='container'>
// 				{
// 					logged === false ?
// 						<div className='login'>
// 							<h1>Log in</h1>
// 							<input type="text" placeholder="User id" onChange={(e) => dispatch(setUser({id: e.target.value}))}/>
// 							<input type="submit" value="Log in" onClick={(e) => setGood(e)}/>
// 						</div>
// 					:
// 					<div className='selectChannelOrDm'>
// 						<button className={mode === "channel" ? "selectedButton" : null + ' selectButton'} onClick={() => handleChangeMode("channels")}>Channels</button>
// 						<button className={mode === "dm" ? "selectedButton" : null + ' selectButton'} onClick={() => handleChangeMode("dm")}>Private Messages</button>
// 						{
// 							mode === "channels" ?
// 								<Channels />
// 							:
// 								<PrivateMessages />
// 						}
// 					</div>
// 				}
// 			</div>
// 		</div>
// 	);
// }

// export default ChatPage;
export {}