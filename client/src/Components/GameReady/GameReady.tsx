import axios from "axios";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { createNotification } from "../notif/Notif";
import React from "react";
import "./GameReady.scss";
import { PacmanLoader, ScaleLoader } from "react-spinners";
import NavBar from "../Nav/NavBar";
import { useSelector } from "react-redux";
import { getSockeGame } from "../../Redux/gameSlice";
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
  const socket = useSelector(getSockeGame);

  // const [propsOn, setPropsOn] = useState<boolean>(false);

  useEffect(() => {
    if (searching && !tmpUserBoolean) {
      setTmpUserBoolean(true);
      console.log("hey");
      console.log("say searching", tmpUser);
      socket?.on("searching-" + tmpUser.id, (data: IRoom) => {
        console.log("receive searching", data);
        setSearchingDisplay(true);

        setNotificaton(false);
        setRoom(data);
      });
      socket?.emit("searching", tmpUser);
      console.log("emit searching", socket);
    }
  }, [searching, tmpUser, tmpUserBoolean, socket]);
  //useEffect(() => {
  //if (!propsOn) {
  //  console.log("propsOn");
  //setPropsOn(true);
  useEffect(() => {
    socket?.removeListener("configuring");
    socket?.removeListener("configurationUpdated");
    socket?.removeListener("playerLeave");

    socket?.on("configuring", (data: IRoom) => {
      console.log("receive configuring", data);
      setSearchingDisplay(false);
      setConfiguringDisplay(true);
    });
    socket?.on("configurationUpdated", (data: IRoom) => {
      console.log(
        "receive configurationUpdated",
        data.configurationB,
        data.configurationA,
        data.playerA,
        data.playerB,
        tmpUser,
        data
      );
      if (data.playerA?.id === tmpUser?.id) setSettingsBis(data.configurationB);
      else setSettingsBis(data.configurationA);
    });
    socket?.on("playerLeave", () => {
      console.log("receive cancelSearching");
      createNotification("info", "L'autre connard a leave 1");
      setNotificaton(true);
      setSearchingDisplay(true);
      setSearching(true);
      setTmpUserBoolean(true);
      setConfiguringDisplay(false);
      setSettings(undefined);
    });
  }, [
    notification,
    tmpUser,
    tmpUserBoolean,
    searching,
    searchingDisplay,
    configuringDisplay,
    socket,
  ]);
  // }
  //}, [propsOn, socket, User, searchingDisplay, configuringDisplay, searching, tmpUserBoolean, settingsBis, settings, room, tmpUser, error, success]);

  const getUser = async () => {
    const messages = await axios
      .get(`http://90.66.192.148:7000/user`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .catch((err) => {
        console.log(err);
      });
    if (messages?.data && messages.data?.User) {
      console.log(messages.data.User, {
        id: messages.data.User.uuid,
        name: messages.data.User.username,
      });
      setTmpUser({
        id: messages.data.User.uuid,
        name: messages.data.User.username,
      });
    }
  };
  useEffect(() => {
    getUser();
  }, []);
  async function handleReady() {
    console.log("hey", socket);
    props.setPlayerId(tmpUser.id);
    props.setPlayerName(tmpUser.name);
    setNotificaton(false);
    setSearching(true);
  }
  return (
    <div>
      {!searchingDisplay && !configuringDisplay ? (
        <div>
          <button onClick={handleReady} className="play-button">
            Search for a game
          </button>
        </div>
      ) : null}
      {searchingDisplay ? (
        <div>
          <ScaleLoader
            className="loading-spinner"
            color={"#123abc"}
            loading={true}
            height={65}
            speedMultiplier={0.75}
            width={10}
          />
          {
            //<p className="waiting-text">Searching for a game...</p>
          }
          <button
            onClick={
              () => {
                socket?.emit("cancelSearching", { tmpUser, room });
                setSearchingDisplay(false);
                setConfiguringDisplay(false);
                setSearching(false);
                setTmpUserBoolean(false);
              } /*Cancel search*/
            }
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      ) : null}
      {configuringDisplay ? (
        <div>
          <div className="game-config">
            <p>Configuring the game...</p>
            <div className="ChannelRoomFormInput-Difficulty">
              <label htmlFor="Difficulty">Difficulty </label>
              <select
                className="game-config-select"
                defaultValue="undefined"
                id="Difficulty"
                onChange={(e) => {
                  if (e.target.value === "undefined") return;
                  if (settings)
                    setSettings({ ...settings, difficulty: e.target.value });
                  else
                    setSettings({
                      difficulty: e.target.value,
                      background: "",
                      confirmed: false,
                    });
                  socket?.emit("updateConfirugation", {
                    difficulty: e.target.value,
                    background: settings?.background,
                    confirmed: false,
                  });
                }}
              >
                <option key="undefined" disabled value="undefined">
                  Select a difficulty
                </option>
                <option key="easy" value="easy">
                  Easy
                </option>
                <option key="medium" value="medium">
                  Medium
                </option>
                <option key="hard" value="hard">
                  Hard
                </option>
              </select>
            </div>
            <div className="ChannelRoomFormInput-Background">
              <label htmlFor="Background">Background </label>
              <select
                className="game-config-select"
                defaultValue="undefined"
                id="Background"
                onChange={(e) => {
                  if (e.target.value === "undefined") return;
                  if (settings)
                    setSettings({ ...settings, background: e.target.value });
                  else
                    setSettings({
                      difficulty: "",
                      background: e.target.value,
                      confirmed: false,
                    });
                  socket?.emit("updateConfirugation", {
                    difficulty: settings?.difficulty,
                    background: e.target.value,
                    confirmed: false,
                  });
                }}
              >
                <option key="undefined" disabled value="undefined">
                  Select a background
                </option>
                <option key="background1" value="background1">
                  Background 1
                </option>
                <option key="background2" value="background2">
                  Background 2
                </option>
              </select>
            </div>

            <button
              className="game-config-button"
              onClick={
                () => {
                  console.log("cancel searching", tmpUser);
                  socket?.emit("cancelSearching", { tmpUser, room });
                  setSearchingDisplay(false);
                  setSearching(false);
                  setTmpUserBoolean(false);
                  setConfiguringDisplay(false);
                  setSettings(undefined);
                } /*Cancel search*/
              }
            >
              Cancel
            </button>
            <button
              className="game-config-button"
              onClick={
                () => {
                  if (
                    settings?.difficulty &&
                    settings?.background &&
                    settings?.confirmed === false
                  ) {
                    setSettings({ ...settings, confirmed: true });
                    socket?.emit("confirmConfiguration", settings);
                  }
                  else {
                    console.log ("settings", settings);
                  }
                } /*Cancel search*/
              }
            >
              Ready
            </button>
          </div>
          <div className="game-config-secondary">
            <p>Configuration of the other player</p>
            <div className="ChannelRoomFormInput-Difficulty">
              <label htmlFor="Difficulty">Difficulty </label>
              {settingsBis?.difficulty ? (
                <p>{settingsBis.difficulty}</p>
              ) : (
                <p>Not set</p>
              )}
            </div>
            <div className="ChannelRoomFormInput-Background">
              <label htmlFor="Difficulty">Background </label>
              {settingsBis?.background ? (
                <p>{settingsBis.background}</p>
              ) : (
                <p>Not set</p>
              )}
            </div>
            Ready : {settingsBis?.confirmed ? <p>Yes</p> : <p>No</p>}
          </div>
        </div>
      ) : null}
      <div></div>
    </div>
  );
}

export default GameReady;
