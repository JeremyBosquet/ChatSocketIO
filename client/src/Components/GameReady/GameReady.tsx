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
  configurationA : IConfiguration;
  configurationB: IConfiguration;
}

interface IConfiguration{
  difficulty: string;
  background: string;
}

interface ISettings{
  defaultSpeed: number;
  defaultDirection: number;
  boardWidth: number;
  boardHeight: number;
  ballRadius: number;
}
interface IConfiguration{
  difficulty: string;
  background: string;
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
  const [settings, setSettings] = useState<IConfiguration>();
  const [settingsBis, setSettingsBis] = useState<IConfiguration>();
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
    props.socket?.on("configurationUpdated", (data : IRoom) => {
      console.log("receive configurationUpdated");
      if (data.playerA.id === User)
        setSettingsBis(data.configurationB);
      else
        setSettingsBis(data.configurationA);
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
  function updateConfiguration(e : any)
  {
    const tmp = settings;
    if (tmp?.background)
      tmp.background = e.target.value;
    if (tmp?.difficulty)
      tmp.difficulty = e.target.value;
    setSettings(tmp);
    props.socket?.emit("updateConfirugation", {tmpUser, settings});
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
      <div>
        <p>Configuring the game...</p>
        <div className="ChannelRoomFormInput-Difficulty">
          <label htmlFor="Difficulty">Difficulty </label>
          <select defaultValue="undefined" id="Difficulty" onChange={(e) => updateConfiguration(e)}>
            <option key="undefined" disabled value="undefined">Select a difficulty</option>
            <option key="easy" value="1">Easy</option>
            <option key="medium" value="2">Medium</option>
            <option key="hard" value="3">Hard</option>
          </select>
        </div>
        <div className="ChannelRoomFormInput-Background">
          <label htmlFor="Background">Background </label>
          <select defaultValue="undefined" id="Background" onChange={(e) => updateConfiguration(e)}>
            <option key="undefined" disabled value="undefined">Select a background</option>
            <option key="1" value="1">Background 1</option>
            <option key="2" value="2">Background 2</option>
          </select>
        </div>

        <button onClick={() => {
          props.socket?.emit("cancelSearching", {tmpUser, room});
          setSearchingDisplay(false);
          setSearching(false);
          setTmpUserBoolean(false);
          setTmpUser(null);
          setConfiguringDisplay(false);
        }/*Cancel search*/}>Cancel</button>
        <button onClick={() => {
          props.socket?.emit("confirmConfiguration", {tmpUser, settings});
          props.setReady(true);
        }/*Cancel search*/}>Ready</button>
      </div>
      <div>
        <p>Configuration of the other player</p>
        <div className="ChannelRoomFormInput-Difficulty">
          <label htmlFor="Difficulty">Difficulty </label>
          {settingsBis?.difficulty ? (<p>{settingsBis.difficulty}</p>) : (<p>Not set</p>)}
        </div>
      </div>
      </div>) : (null)}
        <div>
          { error ? <p>{error}</p> : null }
          { success ? <p>{success}</p> : null }
        </div>
    </div>
  );
}

export default GameReady;
