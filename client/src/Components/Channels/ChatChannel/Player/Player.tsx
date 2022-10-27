import { Menu, MenuButton } from "@szhsin/react-menu";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUser } from "../../../../Redux/authSlice";
import { getSelectedChannel, getSocket } from "../../../../Redux/chatSlice";
import { Iuser, IuserDb } from "../interfaces/users";
import './Player.scss';

interface props {
    users: IuserDb[];
    user: IuserDb;
    usersConnected: Iuser[];
}

function Player(props : props) {
  const [connected, setConnected] = useState<boolean>(false);

  const socket = useSelector(getSocket);
  const selectedChannel = useSelector(getSelectedChannel);
  const me = useSelector(getUser);

  useEffect(() => {
    async function isConnected(user: IuserDb) {
      let userFinded = await props.usersConnected.find(userConnected => userConnected.userId === user.id);
      if (userFinded)
      {
        setConnected(true);
        return (true);
      }
      setConnected(false);
      return (false);
    }

    isConnected(props.user);
    //eslint-disable-next-line
  }, [props.usersConnected])

  const handleKick = async (targetId: string) => {
    await axios.post(`http://localhost:4000/api/chat/channel/kick/`, {
      channelId: selectedChannel,
      target: targetId,
      admin: me.id
    }).then(res => {
      socket?.emit("kick", {channelId: selectedChannel, target: targetId});
    });
  }

  const handleBan = async (targetId: string) => {
    let duration = new Date().toISOString();
    console.log(duration)
    let permanent = false;

    await axios.post(`http://localhost:4000/api/chat/channel/ban/`, {
      channelId: selectedChannel,
      target: targetId,
      admin: me.id,
      time: duration.toString(),
      isPermanent: permanent
    }).then(res => {
      socket?.emit("kick", {channelId: selectedChannel, target: targetId});
    });
  }

  return (
    <div className='player' key={Math.random()}>
      <p>{props.user?.name} {connected ? <span className="connected"></span> : <span className="disconnected"></span>}</p> 
      {
        props.user?.id === me.id ?
        null :
        <Menu className="playerActions" menuButton={<MenuButton>⁝</MenuButton>}> 
              {(props.user.role !== 'admin' && props.user.role !== 'owner') ?
                  <>
                    <button onClick={e => handleKick(props.user.id)}>Kick</button>
                    <button onClick={e => handleBan(props.user.id)}>Ban</button>
                    <button>Mute</button>
                  </>
                : null
              }
              <button>Profile</button>
              <button>Block</button>
              <button>Add friend</button>
            </Menu>
      }
    </div>
  );
}

export default Player;