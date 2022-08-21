import { useEffect, useState } from 'react';
import FormChat from '../../Components/FormChat/FormChat';
import io, { Socket } from 'socket.io-client';
import ChatMessage from '../../Components/ChatMessage/ChatMessage';
import SendMessage from '../../Components/SendMessage/SendMessage';
import LeaveRoom from '../../Components/LeaveRoom/LeaveRoom';

interface Imessage {
  id: string;
  name: string;
  message: string;
  room: string;
  date: string;
}

interface Iuser {
  id: string;
  name: string;
  room: string;
}

function HomePage() {
  const [socket, setSocket] = useState<Socket>();
  const [name, setName] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [messages, setMessages] = useState<Imessage[]>([]);
  const [users, setUsers] = useState<Iuser[]>([]);
  const [joined, setJoined] = useState<boolean>(false);

  useEffect(() => { // Connect to the socket
    const newSocket = io('http://localhost:4001');
    setSocket(newSocket);
  }, []);

  useEffect(() => { // Event listener from socket server
    socket?.on('messageFromServer', (message: Imessage) => {
      setMessages([...messages, message]);
    });

    socket?.on('usersConnected', (users: Iuser[]) => {
      setUsers(users);
    });
  }, [socket, messages]);

  return (
    <div>
      {/* Form to join a chat room */}
      { !joined ? <FormChat socket={socket} name={name} room={room} setName={setName} setRoom={setRoom} setJoined={setJoined} setMessages={setMessages}/> : null }

      {/* Users connected */}
      {joined && users?.length > 0 ? <h3>User(s) connected:</h3> : null}
      { 
        joined && users?.map((user: Iuser) => {
          return <div key={Math.random()}>{user.name}</div>
        })
      }
      {/* Form to send message */}
      { joined ? ( <SendMessage socket={socket} name={name} room={room}/> ) : ( null ) }

      { joined ? ( <LeaveRoom socket={socket} name={name} room={room} setJoined={setJoined} setRoom={setRoom} setMessages={setMessages} setUsers={setUsers}/> ) : ( null ) }

      {/* Print messages */}
      {messages.map((message : Imessage) => ( 
        <ChatMessage key={message.id}  name={message.name} message={message.message} room={message.room} date={message.date}/>
      ))}

    </div>
  );
}

export default HomePage;
