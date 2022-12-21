
import { useEffect, useState } from 'react';
import { Iuser, IuserDb } from './interfaces/users';
import SendMessage from './SendMessage/SendMessage';
import Player from './Player/Player';
import Messages from './Messages/Messages';
import { Imessage } from './interfaces/messages';
import './DMChannel.scss'
import { useDispatch, useSelector } from 'react-redux';
import { getSocket, setChannels } from '../../../Redux/chatSlice';
import { getUser } from '../../../Redux/authSlice';
import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { IoMdLock } from 'react-icons/io';
import instance from '../../../API/Instance';

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
    await instance.get("chat/dms/user/" + userId)
    .then((res) => {
        if (res)
          dispatch(setChannels(res.data));
    })
  }

  const getMessages = async () => {
    await instance.get("chat/dm/messages/" + selectedChannelDM + '/' + user.uuid)
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
      const dm = (await instance.get("chat/dm/" + selectedChannelDM)).data;
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
      const userId = dm?.users[0]?.uuid === user.uuid ? dm?.users[1]?.uuid : dm?.users[0]?.uuid;
      const u = (await instance.get(`chat/user/` + userId)).data;
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
        console.log(usersConnected)
        setUsersConnected(usersConnected);
      });
    }
  }, [socket])


  return (
    <>
      <div className='ChatChannel'>
      {
          !name ? <h2>Select a channel</h2> :
          <>
            <div className='ChatChannelInfos'>
              <p>{name}</p>
              <IoMdLock className='channelIcon' />
            </div>
            <Messages userId={user.uuid} messages={messages} users={users} setUsers={setUsers} setMessages={setMessages}/>
            <div className='sendMessage'>
              <SendMessage channelId={selectedChannelDM} user={user}/>
            </div>
          </>
        }
      </div>
      <div className='playersList'>
        <div className='playersTitle'>
					<p>Players</p>
				</div>
        <div className='players'>
          {users?.map((user : any) => ( 
						user.print === undefined && user.print !== false ?
							<Player key={user.uuid} setUsers={setUsers} users={users} user={user} usersConnected={usersConnected} />
						: null
					))}
        </div>
      </div>
    </>
  );
}

export default DMChannel;
