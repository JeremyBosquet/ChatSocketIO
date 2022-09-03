import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Channels from '../../Components/Channels/Channels';
import './ChatPage.scss'

function ChatPage() {
  const [socket, setSocket] = useState<Socket>();
  const [user, setUser] = useState<{id: string}>({id: "72e86254-9a03-46c9-9232-e86e203a2de7"})
  const [mode, setMode] = useState<string>("channels");

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

  return (
    <div className='chatPage'>
      <div className='container'>
        <div className='selectChannelOrDm'>
          <button className={mode === "channel" ? "selectedButton" : null + ' selectButton'} onClick={e => changeMode("channels")}>Channels</button>
          <button className={mode === "dm" ? "selectedButton" : null + ' selectButton'} onClick={e => changeMode("dm")}>Private Messages</button>
        </div>
        {
          mode === "channels" ?
            <Channels socket={socket} user={user}/>
          :
            <div>DM</div>
        }
      </div>
    </div>
  );
}

export default ChatPage;
