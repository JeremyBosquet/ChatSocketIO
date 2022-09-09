import { useEffect, useState } from 'react';
// import FormChat from '../../Components/FormChat/FormChat';
import io, { Socket } from 'socket.io-client';
// import ChatMessage from '../../Components/Channels/ChatChannel/ChatMessage/ChatMessage';
// import SendMessage from '../../Components/Channels/ChatChannel/SendMessage/SendMessage';
// import LeaveRoom from '../../Components/LeaveRoom/LeaveRoom';
// import axios from 'axios';
import { Iuser } from '../../Components/Channels/ChatChannel/interfaces/users';

interface Imessage {
  id: string;
  userId: string;
  message: string;
  channelId: string;
  date: string;
}

function HomePage() {
  const [socket, setSocket] = useState<Socket>();
  // const [name, setName] = useState<string>("");
  // const [room, setRoom] = useState<string>("");
  const [messages, setMessages] = useState<Imessage[]>([]);
  // const [usersConnected, setUsersConnected] = useState<Iuser[]>([]);
  // const [joined, setJoined] = useState<boolean>(false);

  useEffect(() => { // Connect to the socket
    const newSocket = io('http://localhost:4001');
    setSocket(newSocket);
  }, []);

  useEffect(() => { // Event listener from socket server
    socket?.on('messageFromServer', (message: Imessage) => {
      setMessages([...messages, message]);
    });

    socket?.on('usersConnected', (users: Iuser[]) => {
      // setUsersConnected(users);
    });
  }, [socket, messages]);

  // const getChannelInfos = async (e: any) => {
  //   const channelInfos = await axios.get("http://localhost:4000/api/chat/channel/?id=" + e.target.value);

  //   console.log(channelInfos.data);
  // }

  return (
    <></>
    // <div>
    //   {/* Form to join a chat room
    //   { !joined ? <FormChat socket={socket} name={name} room={room} setName={setName} setRoom={setRoom} setJoined={setJoined} setMessages={setMessages}/> : null }

    //   {/* Users connected */}
    //   {joined && usersConnected?.length > 0 ? <h3>User(s) connected:</h3> : null}
    //   { 
    //     joined && usersConnected?.map((user: Iuser) => {
    //       return <div key={Math.random()}>{user.name}</div>
    //     })
    //   } 
    //   {/* Form to send message */}
    //   { joined ? ( <SendMessage socket={socket} user={{id: name}} channelId={room}/> ) : ( null ) }

    //   { joined ? ( <LeaveRoom socket={socket} name={name} room={room} setJoined={setJoined} setRoom={setRoom} setMessages={setMessages} setUsers={setUsersConnected}/> ) : ( null ) }

    //   {/* Print messages */}
    //   {messages.map((message : Imessage) => ( 
    //     <ChatMessage key={message.id} userId={name} users={usersConnected} message={message.message} channelId={message.channelId} date={message.date}/>
    //   ))}
            
    //   <input onChange={getChannelInfos}></input> */}
    // </div>
  );
}

export default HomePage;
