import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
/*
  Check if player search on another tab
*/
interface props {
  socket : Socket | undefined;
  setReady: (ready : boolean) => void;
  setPlayerId: (playerId : string) => void;
  setPlayerName: (playerName : string) => void;
  users : IUsers[];
}

interface IUsers {
  id: string;
  name: string;
  image: string;
  createdAt: string;
}

interface IPlayer {
  id: string;
  name: string;
  score: number;
  status: string;
  x: number;
  y: number;
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
}

interface ISettings{
  defaultSpeed: number;
  defaultDirection: number;
  boardWidth: number;
  boardHeight: number;
  ballRadius: number;
}

interface ICanvasBoard {
  x: number;
  y: number;
  id: string;
}

interface IBall {
  x: number;
  y: number;
  speed: number;
  direction: number;
}

interface ICanvasBall {
  x: number;
  y: number;
  id: string;
}

function GameReady(props : props) {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [User, setUser] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [searchingDisplay, setSearchingDisplay] = useState<boolean>(false);
  const [room, setRoom] = useState<IRoom>();
  const [tmpUser, setTmpUser] = useState<any>(null);
  const [tmpUserBoolean, setTmpUserBoolean] = useState<boolean>(false);
  const [configuringDisplay, setConfiguringDisplay] = useState<boolean>(false);
  useEffect(() => {
    if (searching && !tmpUserBoolean) {
      setTmpUserBoolean(true);
      const tmp = {name: props.users.find(user => user.id === User)?.name, id: User};
      setTmpUser(tmp);
      console.log("say searching", tmp);
      props.socket?.on("searching-" + User, (data : IRoom) => {
        console.log("receive searching", data);
        setSearchingDisplay(true);
        setRoom(data);
      });
      props.socket?.emit("searching", tmp);
      
    }
  }, [searching, tmpUser, tmpUserBoolean]);

  useEffect(() => {
    props.socket?.on("configuring", (data : IRoom) => {
      console.log("receive configuring", data);
      setSearchingDisplay(false);
      setConfiguringDisplay(true);
    });
  });
  useEffect(() => {
    props.socket?.on("playerLeave", (any) => {
      console.log("receive cancelSearching");
      setSearchingDisplay(true);
      setSearching(true);
      setTmpUserBoolean(true);
      setConfiguringDisplay(false);
    });
  });

  function handleReady() {
    if (!User)
      return ;
    props.setPlayerId(User);
    const result = props.users.find(user => user.id === User)?.name;
    if (result)
     props.setPlayerName(result);
    else
      props.setPlayerName("");
    setSearching(true);
  }
  return (
    <div>
      {!searchingDisplay && !configuringDisplay ? (<div>
        Select an account : <br/> {/*Ready main action*/}
        <button onClick={handleReady}>Search for a game</button>
        <select defaultValue="undefined" id="playerId" onChange={(e) => setUser(e.target.value)}>
          <option key="undefined" disabled value="undefined">Select a player</option>
          {props.users.map((user : IUsers) => {
            return <option key={user.id} value={user.id}>{user.name}</option>
          }
          )}
        </select>
      </div>) : (null)}
      {searchingDisplay ? (
      <div>
        <p>Searching for a game...</p>
        <button onClick={() => {
          props.socket?.emit("cancelSearching", {tmpUser, room});
          setSearchingDisplay(false);
          setConfiguringDisplay(false); 
          setSearching(false);
          setTmpUserBoolean(false);
          setTmpUser(null);
        }/*Cancel search*/}>Cancel</button>
      </div>) : (null)}
      {configuringDisplay ? (
      <div>
        <p>Configuring the game...</p>
        
        <button onClick={() => {
          props.socket?.emit("cancelSearching", {tmpUser, room});
          setSearchingDisplay(false);
          setSearching(false);
          setTmpUserBoolean(false);
          setTmpUser(null);
          setConfiguringDisplay(false);
        }/*Cancel search*/}>Cancel</button>
      </div>) : (null)}
        <div>
          { error ? <p>{error}</p> : null }
          { success ? <p>{success}</p> : null }
        </div>
    </div>
  );
}

export default GameReady;
