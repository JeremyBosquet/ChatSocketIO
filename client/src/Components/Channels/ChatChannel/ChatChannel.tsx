import axios from 'axios';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Iuser, IuserDb } from './interfaces/users';
import SendMessage from './SendMessage/SendMessage';
import Player from './Player/Player';
import Messages from './Messages/Messages';
import { Imessage } from './interfaces/messages';
import './ChatChannel.scss'

interface props {
    socket: Socket | undefined;
    user: {id: string};
    selectedChannel: string;
}

interface Ichannel {
  id: string;
  name: string;
  users: IuserDb[];
}

function ChatChannel(props: props) {
  const [messages, setMessages] = useState<Imessage[]>([]);
  const [users, setUsers] = useState<IuserDb[]>([]);
  const [usersConnected, setUsersConnected] = useState<Iuser[]>([]);
  const [channel, setChannel] = useState<Ichannel>();

  useEffect(() => {
    setMessages([]);

    const getMessages = async () => {
      const messages = await axios.get(`http://localhost:4000/api/chat/messages/` + props.selectedChannel);

      if (messages?.data)
        setMessages(messages.data);
    }

    if (props.selectedChannel !== "")
    {
      props.socket?.emit("join", {channelId: props.selectedChannel, userId: props.user.id});
      getMessages();
    }

    const getChannel = async () => {
      const channel = (await axios.get(`http://localhost:4000/api/chat/channel/` + props.selectedChannel)).data;
      setChannel(channel);
      setUsers(channel.users);
    }

    getChannel();
  }, [props.socket, props.selectedChannel, props.user.id])

  useEffect(() => { // Event listener from socket server
    props.socket?.on('messageFromServer', (message: Imessage) => {
      setMessages([...messages, message]);
    });

    props.socket?.on('usersConnected', (usersConnected: Iuser[]) => {
      setUsersConnected(usersConnected);
    });

    props.socket?.on('updateAllPlayers', (usersDb: IuserDb[]) => {
      setUsers(usersDb);
    });
  }, [props.socket, messages]);


  return (
    <>
      <div className='ChatChannel'>
          <div>
            {channel?.name ? <h2>{channel.name}</h2> : <h2>Select a channel</h2>}
          </div>
          {/* Print messages */}
          <Messages userId={props.user.id} messages={messages} users={users}/>
          <div className='sendMessage'>
              <SendMessage socket={props.socket} channelId={props.selectedChannel} user={props.user}/>
          </div>
      </div>
      <div className='playersList'>
          <h2>Players</h2>
          <div className='messages'>
            {users?.map((user : any) => ( 
              <Player key={user.id} me={props.user.id} users={users} user={user} usersConnected={usersConnected}/>
            ))}
          </div>
      </div>
    </>
  );
}

export default ChatChannel;
