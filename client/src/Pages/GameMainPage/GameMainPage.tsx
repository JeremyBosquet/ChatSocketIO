import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import RoomInfo from '../../Components/RoomInfo/RoomInfo';
import FormCreateRoom from '../../Components/FormCreateRoom/FormCreateRoom';

interface Irooms {
  id: string;
  name: string;
  owner: string;
  nbPlayers: number;
  status: string;
  createdAt: string;
  settings: ISettings;
}

interface ISettings{
  defaultSpeed: number;
  defaultDirection: number;
  boardWidth: number;
  boardHeight: number;
  ballRadius: number;
}


function GameMainPage() {
  const [socket, setSocket] = useState<Socket>();
  const [rooms, setRooms] = useState<Irooms[]>([]);

  const getRooms = async (e : any) => {
    const messages = await axios.get(`http://localhost:5000/api/room/getRooms`);

    if (messages?.data) {
      setRooms(messages.data);
    }
  }
  useEffect(() => { // Connect to the socket
    const newSocket = io('http://localhost:5002');
    setSocket(newSocket);
    getRooms(null);
    
  }, []);
  useEffect(() => { // Event listener from socket server
    socket?.on('roomCreated', (rooms: Irooms[]) => {
      setRooms(rooms);
    });
  }, [socket]);
  return (
    <div>
      
      {rooms.map((room : Irooms) => (
        <RoomInfo key={room.id} id={room.id} owner={room.owner} status={room.status} nbPlayers={room.nbPlayers} name={room.name} createdAt={room.createdAt} settings={room.settings}/>
      ))}
      <button onClick={getRooms}>Click me</button>
    </div>
  );
}

export default GameMainPage;

/*
dev :

      <FormCreateRoom socket={socket}/>
*/