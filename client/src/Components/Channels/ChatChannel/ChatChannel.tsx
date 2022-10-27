import axios from 'axios';
import { useEffect, useState } from 'react';
import { Iuser, IuserDb } from './interfaces/users';
import SendMessage from './SendMessage/SendMessage';
import Player from './Player/Player';
import Messages from './Messages/Messages';
import { Imessage } from './interfaces/messages';
import './ChatChannel.scss'
import { useDispatch, useSelector } from 'react-redux';
import { getSelectedChannel, getSocket, setChannels, setSelectedChannel } from '../../../Redux/chatSlice';
import { getUser } from '../../../Redux/authSlice';

interface Ichannel {
  id: string;
  name: string;
  users: IuserDb[];
}

function ChatChannel() {
  const [messages, setMessages] = useState<Imessage[]>([]);
  const [users, setUsers] = useState<IuserDb[]>([]);
  const [usersConnected, setUsersConnected] = useState<Iuser[]>([]);
  const [channel, setChannel] = useState<Ichannel>();

  const selectedChannel = useSelector(getSelectedChannel);
  const user = useSelector(getUser);
  const socket = useSelector(getSocket);

  const dispatch = useDispatch();

  useEffect(() => {
    setMessages([]);

    const getMessages = async () => {
      const messages = await axios.get(`http://localhost:4000/api/chat/messages/` + selectedChannel);

      if (messages?.data)
        setMessages(messages.data);
    }

    if (selectedChannel !== "")
    {
      socket?.emit("join", {channelId: selectedChannel, userId: user.id});
      getMessages();
    }

    const getChannel = async () => {
      const channel = (await axios.get(`http://localhost:4000/api/chat/channel/` + selectedChannel)).data;
      setChannel(channel);
      setUsers(channel.users);
    }

    getChannel();
  }, [socket, selectedChannel, user.id])

  useEffect(() => { // Event listener from socket server

    const getUsersChannel = async (userId: any) => {
      await axios.get("http://localhost:4000/api/chat/channels/user/" + userId)
      .then((res) => {
          if (res)
            dispatch(setChannels(res.data));
      })
    }

    socket?.on('messageFromServer', (message: Imessage) => {
      setMessages([...messages, message]);
    });

    socket?.on('usersConnected', (usersConnected: Iuser[]) => {
      setUsersConnected(usersConnected);
    });

    socket?.on('updateAllPlayers', (usersDb: IuserDb[]) => {
      setUsers(usersDb);
    });

    socket?.on('kickFromChannel', (data: {target: string, channelId: string}) => {
      if (data.target === user.id)
      {
        console.log("You have been kicked from the channel");
        if (selectedChannel === data.channelId)
        {
          socket?.emit('leavePermanant', { userId: user.id, channelId: data.channelId });
          getUsersChannel(user.id);
          if (selectedChannel === data.channelId)
              dispatch(setSelectedChannel(""));
        }
      }
    });
    // eslint-disable-next-line
  }, [socket, messages]);


  return (
    <>
      <div>
        <div className='ChatChannel'>
            <div>
              {channel?.name ? <h2>{channel.name}</h2> : <h2>Select a channel</h2>}
            </div>
            {/* Print messages */}
            <Messages userId={user.id} messages={messages} users={users}/>
            <div className='sendMessage'>
                <SendMessage channelId={selectedChannel} user={user}/>
            </div>
        </div>
      </div>
      <div className='playersList'>
          <h2>Players</h2>
          <div className='messages'>
            {users?.map((user : any) => ( 
              <Player key={user.id} users={users} user={user} usersConnected={usersConnected}/>
            ))}
          </div>
      </div>
    </>
  );
}

export default ChatChannel;
