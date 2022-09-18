import { Menu, MenuButton } from "@szhsin/react-menu";
import { useEffect, useState } from "react";
import { Iuser, IuserDb } from "../interfaces/users";
import './Player.scss';

interface props {
    users: IuserDb[];
    user: IuserDb;
    me: string;
    usersConnected: Iuser[];
}

function Player(props : props) {
  const [connected, setConnected] = useState<boolean>(false);

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

  // 
  return (
    <div className='player' key={Math.random()}>
      <p>{props.user?.name} {connected ? <span className="connected"></span> : <span className="disconnected"></span>}</p> 
      {
        props.user?.id === props.me ?
          null :
          <Menu className="playerActions" menuButton={<MenuButton>⁝</MenuButton>}> 
            <button>Profile</button>
            <button>Block</button>
            <button>Add friend</button>
          </Menu>
      }
    </div>
  );
}

export default Player;