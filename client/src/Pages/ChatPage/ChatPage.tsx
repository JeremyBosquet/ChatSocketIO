import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Channels from '../../Components/Channels/Channels';
import './ChatPage.scss'

function ChatPage() {
	const [socket, setSocket] = useState<Socket>();
	// const user : {id: string} = ({id: "72e86254-9a03-46c9-9232-e86e203a2de7"})
	const [mode, setMode] = useState<string>("channels");
	const [selectedChannel, setSelectedChannel] = useState<string>("");
	
	const [user, setUser] = useState<{id: string}>({id: ""});
	const [logged, setLogged] = useState<boolean>(false);


	useEffect(() => { // Connect to the socket
		const newSocket = io('http://localhost:4001');
		setSocket(newSocket);
	}, []);

	const changeMode = (newMode: string) => {
		if (newMode === mode)
			return ;
		else
			setMode(newMode);
	}

	const setGood = (e: any) => {
		e.preventDefault();
		if (user?.id !== "")
			setLogged(true)
	}

	return (
		<div className='chatPage'>
			<div className='container'>
				{
					logged === false ?
						<div className='login'>
							<h1>Log in</h1>
							<input type="text" placeholder="User id" onChange={(e) => setUser({id: e.target.value})}/>
							<input type="submit" value="Log in" onClick={(e) => setGood(e)}/>
						</div>
					:
					<div className='selectChannelOrDm'>
						<button className={mode === "channel" ? "selectedButton" : null + ' selectButton'} onClick={e => changeMode("channels")}>Channels</button>
						<button className={mode === "dm" ? "selectedButton" : null + ' selectButton'} onClick={e => changeMode("dm")}>Private Messages</button>
						{
							mode === "channels" ?
								<Channels socket={socket} user={user} setSelectedChannel={setSelectedChannel} selectedChannel={selectedChannel}/>
							:
								<div>DM</div>
						}
					</div>
				}
			</div>
		</div>
	);
}

export default ChatPage;
