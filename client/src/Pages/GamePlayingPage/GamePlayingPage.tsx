import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import GameReady from '../../Components/GameReady/GameReady';
import GamePlay from '../../Components/GamePlay/GamePlay';
import axios from 'axios';

/*interface Iready {
  roomId: string;
  playerId: string;
  playerName: string;
}*/

interface IUsers {
  id: string;
  name: string;
  image: string;
  createdAt: string;
}

function GamePlayingPage() {
  const [socket, setSocket] = useState<Socket>();
  const [ready, setReady] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [users, setUsers] = useState<IUsers[]>([]); // List of users in the server (temporary)
  const params = useParams();
  
  const checkRooms = async (e : any) => {
    const messages = await axios.get(`http://localhost:5000/api/room/getRooms`);

    if (messages?.data) {
      for (let i = 0; i < messages.data.length; i++) {
        if (messages.data[i].id === params.id) {
          return ;
        }
      }
      window.location.href = '/game/';
    }
  }
  const getUsers = async (e : any) => {
    const messages = await axios.get(`http://localhost:5000/api/chat/getUsers`);
    console.log(messages.data);
    if (messages?.data) {
      setUsers(messages.data)
    }
  }
  useEffect(() => { // Connect to the socket
    const newSocket = io('http://localhost:5002');
    setSocket(newSocket);
    checkRooms(null);
    getUsers(null);
  }, []);
  useEffect(() => {
    if (ready)
    {
      console.log("game : ", playerId, playerName);
      const ready = {roomId: params.id, playerId: playerId, playerName: playerName};
      if (params.id)
        setRoomId(params.id);
      else
        setRoomId("");
      socket?.emit('playerReady', ready);
      console.log("emit playerReady : ", ready);
    }
  }, [socket, ready, params.id]);
  useEffect(() => {
    if (socket) {
      socket.on('errorRoomIsFull', (error : any) => {
        console.log("errorRoomIsFull", error);
        window.location.href = '/game/';
        //Spectator here
      }
      );
    }
  }, [socket]);
  return (
    <div>
      {!ready ? ( <GameReady users={users} socket={socket} setPlayerId={setPlayerId} setPlayerName={setPlayerName} setReady={setReady}/> ) : null }
      {ready  ? ( <GamePlay socket={socket}/> ) : null }
    </div>
  );
}

export default GamePlayingPage;
