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

interface IPlayer {
  id: string;
  name: string;
  score: number;
  status: string;
  x: number;
  y: number;
}

interface IUsers {
  id: string;
  name: string;
  image: string;
  createdAt: string;

}

interface IBall {
  x: number;
  y: number;
  speed: number;
  direction: number;
}

interface IRoom {
  id: string;
  name: string;
  nbPlayers: number;
  owner: string;
  status: string;
  createdAt: string;
  playerA: IPlayer;
  playerB: IPlayer;
  ball: IBall;
  settings: ISettings;
  configurationA: IConfiguration;
  configurationB: IConfiguration;
}

interface IConfiguration {
  difficulty: string;
  background: string;
  confirmed: boolean;
}

interface ISettings {
  defaultSpeed: number;
  defaultDirection: number;
  boardWidth: number;
  boardHeight: number;
  ballRadius: number;
  background: string;
}

function GamePlayingPage() {
  const [socket, setSocket] = useState<Socket>();
  const [ready, setReady] = useState<boolean>(false);
  const [playing, setPlaying] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [room, setRoom] = useState<IRoom>();
  const params = useParams();

  const checkRooms = async (e: any) => {
    const messages = await axios.get(`http://45.147.97.2:5000/api/room/getRooms`);
    //To delete
    if (messages?.data) {
      for (let i = 0; i < messages.data.length; i++) {
        if (messages.data[i].id === params.id) {
          return;
        }
      }
      //window.location.href = '/game/';
    }
  }

  useEffect(() => { // Connect to the socket
    const newSocket = io('http://45.147.97.2:5002');
    setSocket(newSocket);
    checkRooms(null);
  }, []);
  useEffect(() => {
    if (ready) {
      const ready = { roomId: params.id, playerId: playerId, playerName: playerName };
      socket?.emit('iAmReady', ready);
    }
  }, [socket, ready, params.id]);
  useEffect(() => {
    if (socket) {
      socket.on('errorRoomIsFull', (id: string) => {
        console.log("errorRoomIsFull", id);
        //window.location.href = '/game/';
        //Spectator here
      }
      );
      socket.on('playerReady', (data: IRoom) => {
        if (ready) {
          setRoom(data);
          //if (data?.playerA?.id && data?.playerB?.id)
          //  setPlaying(true);
        }
      }
      );
      socket.on('gameStart', (data: IRoom) => {
        setRoom(data);
        setPlaying(true);
        setReady(false);
      }
      );
      socket.on('playerDisconnected', (data: IRoom) => {
        if (ready) {
          console.log("aPlayerDisconnected : ", data);
          if (playing) {
            setPlaying(false);
            // C'est la merde faut pause la room
          }
          else
            setRoom(data);
        }
      }
      );
      socket.on('gameEnd', (data: IRoom) => {
        console.log("gameEnd", data);
        setRoom(data);
        setPlaying(false);
        setReady(false);

      });
      socket.on('gameForceEnd', (data: IRoom) => {
        console.log("gameForceEnd donc erreur 'sorry l'autre connard a crash'", data);
        setRoom(data);
        setPlaying(false);
        setReady(false);
      });
      socket.on("roomUpdated", (data: IRoom) => {
        console.log("roomUpdated", data);
        setRoom(data);
      });
    }
  }, [socket, ready, playing, room]);

  return (
    <div>
      {!ready && !playing ? (<GameReady socket={socket} setReady={setReady} setPlayerId={setPlayerId} setPlayerName={setPlayerName} />) : null}
      {ready ? (<div> Waiting for another player </div>) : null}
      <p>{ready && !playing ? "PlayerA : " + room?.playerA?.name : null}</p>
      <p>{ready && !playing ? "PlayerB : " + room?.playerB?.name : null}</p>
      {playing ? (<GamePlay playerName={playerName} playerId={playerId} socket={socket} room={room} />) : null}
    </div>
  );
}

export default GamePlayingPage;
