import axios from 'axios';
import { useEffect, useState } from 'react';
import { Iuser, IuserDb } from './interfaces/users';
import SendMessage from './SendMessage/SendMessage';
import Player from './Player/Player';
import Messages from './Messages/Messages';
import { Imessage } from './interfaces/messages';
import './ChatChannel.scss'
import { useDispatch, useSelector } from 'react-redux';
import { getSocket, setChannels } from '../../../Redux/chatSlice';
import { getUser } from '../../../Redux/authSlice';
import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';

interface Ichannel {
  id: string;
  users: IuserDb[];
}

function DMChannel() {
  const [messages, setMessages] = useState<Imessage[]>([]);
  const [users, setUsers] = useState<IuserDb[]>([]);
  const [usersConnected, setUsersConnected] = useState<Iuser[]>([]);
  const [dm, setDm] = useState<any>();
  const [name, setName] = useState<string>();
  const params = useParams();

  const socket = useSelector(getSocket);
  const selectedChannelDM = params.id || "";
  const user = useSelector(getUser);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const getUsersChannel = async (userId: any) => {
    await axios.get("http://90.66.192.148:7000/api/chat/dms/user/" + userId)
    .then((res) => {
        if (res)
          dispatch(setChannels(res.data));
    })
  }

  const getMessages = async () => {
    await axios.get(`http://90.66.192.148:7000/api/chat/dm/messages/` + selectedChannelDM + '/' + user.uuid)
    .then(res => {
      if (res.data)
        setMessages(res.data);
    }).catch(() => {
      getUsersChannel(user.uuid);
      setMessages([]);
      navigate('/chat/dm');
    });
  }
  
  useEffect(() => {
    const getChannel = async () => {
      const dm = (await axios.get(`http://90.66.192.148:7000/api/chat/dm/` + selectedChannelDM)).data;
      setDm(dm);
      setUsers(dm.users);
    }
    if (params.id)
    {
      socket?.emit("join", {channelId: params.id, userId: user.uuid});
      getMessages();
    }
    
    getChannel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  useEffect(() => {
    const getName = async () => {
      const userId = dm?.users[0]?.id === user.uuid ? dm?.users[1]?.id : dm?.users[0]?.id;
      const u = (await axios.get(`http://90.66.192.148:7000/api/chat/user/` + userId)).data;
      if (u?.username)
        setName(u.username);
    }
    if (dm?.id)
      getName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dm])
  
  useEffect(() => {
    if (socket)
    {
      socket.removeListener('messageFromServer');
      socket.on('messageFromServer', (message: Imessage) => {
        setMessages(messages => [...messages, message]);
      });
      
      socket.removeListener('usersConnected');
      socket.on('usersConnected', (usersConnected: Iuser[]) => {
        setUsersConnected(usersConnected);
      });
    }
  }, [socket])


  return (
    <>
      <div>
        <div className='ChatChannel'>
            <div> 
              {name ? <h2>{name}</h2> : <h2>Select a DM</h2>}
            </div>
            {/* Print messages */}
            <Messages userId={user.uuid} messages={messages} users={users} setUsers={setUsers}/>
            <div className='sendMessage'>
              <SendMessage channelId={selectedChannelDM} user={user}/>
            </div>
        </div>
      </div>
      <div className='playersList'>
        <h2>Players</h2>
        <div className='messages'>
          {users?.map((user : any) => ( 
            <Player key={user.uuid} setUsers={setUsers} users={users} user={user} usersConnected={usersConnected} />
          ))}
        </div>
      </div>
    </>
  );
}

export default DMChannel;
