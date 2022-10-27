import axios from "axios";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { createNotification } from "../notif/Notif";
/*
  Check if player search on another tab
*/
interface props {
  socket: Socket | undefined;
  setReady: (ready: boolean) => void;
  setPlayerId: (playerId: string) => void;
  setPlayerName: (playerName: string) => void;
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
  configurationA: IConfiguration;
  configurationB: IConfiguration;
}

interface ISettings {
  defaultSpeed: number;
  defaultDirection: number;
  boardWidth: number;
  boardHeight: number;
  ballRadius: number;
  background: string;
}
interface IConfiguration {
  difficulty: string;
  background: string;
  confirmed: boolean;
}
interface IBall {
  x: number;
  y: number;
  speed: number;
  direction: number;
}

function GameReady(props: props) {
  const [searching, setSearching] = useState<boolean>(false);
  const [searchingDisplay, setSearchingDisplay] = useState<boolean>(false);
  const [room, setRoom] = useState<IRoom>();
  const [tmpUser, setTmpUser] = useState<any>(null);
  const [tmpUserBoolean, setTmpUserBoolean] = useState<boolean>(false);
  const [configuringDisplay, setConfiguringDisplay] = useState<boolean>(false);
  const [settings, setSettings] = useState<IConfiguration>();
  const [settingsBis, setSettingsBis] = useState<IConfiguration>();
  const [notification, setNotificaton] = useState<Boolean>(false);

  // const [propsOn, setPropsOn] = useState<boolean>(false);

  
  
  useEffect(() => {
    if (searching && !tmpUserBoolean) {
      
      setTmpUserBoolean(true);
      console.log("hey");
      console.log("say searching", tmpUser);
      props.socket?.on("searching-" + tmpUser.id, (data: IRoom) => {
        console.log("receive searching", data);
        setSearchingDisplay(true);

        setNotificaton(false);
        setRoom(data);
      });
      props.socket?.emit("searching", tmpUser);

    }
  }, [searching, tmpUser, tmpUserBoolean, props.socket]);
  //useEffect(() => {
  //if (!propsOn) {
  //  console.log("propsOn");
  //setPropsOn(true);
  useEffect(() => {
  props.socket?.removeListener("configuring");
  props.socket?.removeListener("configurationUpdated");
  props.socket?.removeListener("playerLeave");

  props.socket?.on("configuring", (data: IRoom) => {
    console.log("receive configuring", data);
    setSearchingDisplay(false);
    setConfiguringDisplay(true);
  });
  props.socket?.on("configurationUpdated", (data: IRoom) => {
    console.log("receive configurationUpdated", data.configurationB, data.configurationA, data.playerA, data.playerB, tmpUser, data);
    if (data.playerA?.id === tmpUser?.id)
      setSettingsBis(data.configurationB);
    else
      setSettingsBis(data.configurationA);
  });
  props.socket?.on("playerLeave", (any) => {
    console.log("receive cancelSearching");
      createNotification("info", "L'autre connard a leave 1");
    setNotificaton(true);
    setSearchingDisplay(true);
    setSearching(true);
    setTmpUserBoolean(true);
    setConfiguringDisplay(false);
  });
}, [notification, tmpUser, tmpUserBoolean, searching, searchingDisplay, configuringDisplay, props.socket]);
  // }
  //}, [propsOn, props.socket, User, searchingDisplay, configuringDisplay, searching, tmpUserBoolean, settingsBis, settings, room, tmpUser, error, success]);
 
  const getUser = async () => {
    const messages = await axios.get(`http://90.66.192.148:7000/user`, {
      headers: ({
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      })
    }).catch((err) => {
      console.log(err);
    });
    if (messages?.data && messages.data?.User) {
      console.log(messages.data.User, { id: messages.data.User.id, name: messages.data.User.username });
      setTmpUser({ id: messages.data.User.uuid, name: messages.data.User.username });
    }
  }
  useEffect(() => {
    getUser();
  }, []);
  async function handleReady() {
    console.log("hey", tmpUser);
    props.setPlayerId(tmpUser.id);
    props.setPlayerName(tmpUser.name);
    setNotificaton(false);
    setSearching(true);
  }
  return (
    <div>
      {!searchingDisplay && !configuringDisplay ? (<div>
        <button onClick={handleReady}>Search for a game</button>
      </div>) : (null)}
      {searchingDisplay ? (
        <div>
          <p>Searching for a game...</p>
          <button onClick={() => {
            props.socket?.emit("cancelSearching", { tmpUser, room });
            setSearchingDisplay(false);
            setConfiguringDisplay(false);
            setSearching(false);
            setTmpUserBoolean(false);
            
          }/*Cancel search*/}>Cancel</button>
        </div>) : (null)}
      {configuringDisplay ? (
        <div>
          <div>
            <p>Configuring the game...</p>
            <div className="ChannelRoomFormInput-Difficulty">
              <label htmlFor="Difficulty">Difficulty </label>
              <select defaultValue="undefined" id="Difficulty" onChange={(e) => {
                if (e.target.value === "undefined")
                  return;
                if (settings)
                  setSettings({ ...settings, difficulty: e.target.value });
                else
                  setSettings({ difficulty: e.target.value, background: "", confirmed: false });
                props.socket?.emit("updateConfirugation", { difficulty: e.target.value, background: settings?.background, confirmed: false });
              }}>
                <option key="undefined" disabled value="undefined">Select a difficulty</option>
                <option key="easy" value="easy">Easy</option>
                <option key="medium" value="medium">Medium</option>
                <option key="hard" value="hard">Hard</option>
              </select>
            </div>
            <div className="ChannelRoomFormInput-Background">
              <label htmlFor="Background">Background </label>
              <select defaultValue="undefined" id="Background" onChange={(e) => {
                if (e.target.value === "undefined")
                  return;
                if (settings)
                  setSettings({ ...settings, background: e.target.value });
                else
                  setSettings({ difficulty: "", background: e.target.value, confirmed: false });
                props.socket?.emit("updateConfirugation", { difficulty: settings?.difficulty, background: e.target.value, confirmed: false });
              }}>
                <option key="undefined" disabled value="undefined">Select a background</option>
                <option key="background1" value="background1">Background 1</option>
                <option key="background2" value="background2">Background 2</option>
              </select>
            </div>

            <button onClick={() => {
              console.log("cancel searching", tmpUser);
              props.socket?.emit("cancelSearching", {tmpUser, room});
              setSearchingDisplay(false);
              setSearching(false);
              setTmpUserBoolean(false);
              
              setConfiguringDisplay(false);
            }/*Cancel search*/}>Cancel</button>
            <button onClick={() => {
              if (settings?.difficulty && settings?.background && settings?.confirmed === false) {
                setSettings({ ...settings, confirmed: true });
                props.socket?.emit("confirmConfiguration", settings);
              }
            }/*Cancel search*/}>Ready</button>
          </div>
          <div>
            <p>Configuration of the other player</p>
            <div className="ChannelRoomFormInput-Difficulty">
              <label htmlFor="Difficulty">Difficulty </label>
              {settingsBis?.difficulty ? (<p>{settingsBis.difficulty}</p>) : (<p>Not set</p>)}
            </div>
            <div className="ChannelRoomFormInput-Background">
              <label htmlFor="Difficulty">Background </label>
              {settingsBis?.background ? (<p>{settingsBis.background}</p>) : (<p>Not set</p>)}
            </div>
            Ready : {settingsBis?.confirmed ? (<p>Yes</p>) : (<p>No</p>)}
          </div>
        </div>) : (null)}
      <div>
      </div>
    </div>
  );
}

export default GameReady;
