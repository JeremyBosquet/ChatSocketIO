import { Menu, MenuButton } from "@szhsin/react-menu";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUser } from "../../../../Redux/authSlice";
import { Iuser, IuserDb } from "../interfaces/users";
import Ban from "./Ban/Ban";
import Kick from "./Kick/Kick";
import './Player.scss';

interface props {
    users: IuserDb[];
    user: IuserDb;
    usersConnected: Iuser[];
}

function Player(props : props) {
  const [connected, setConnected] = useState<boolean>(false);
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

  return (
    <div className='player' key={Math.random()}>
      <p>{props.user?.name} {connected ? <span className="connected"></span> : <span className="disconnected"></span>}</p> 
      {
        props.user?.id === me.id ?
        null :
        <Menu className="playerActions" menuButton={<MenuButton>⁝</MenuButton>}> 
              {(props.user.role !== 'admin' && props.user.role !== 'owner') ?
                  <>
                    <Ban user={props.user}/>
                    <Kick user={props.user}/>
                    <button className="actionButton">Mute</button>
                  </>
                : null
              }
              <button className="actionButton">Profile</button>
              <button className="actionButton">Block</button>
              <button className="actionButton">Add friend</button>
            </Menu>
      }
    </div>
  );
}

export default Player;