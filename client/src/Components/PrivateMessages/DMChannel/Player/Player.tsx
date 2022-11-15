import { Menu, MenuButton } from "@szhsin/react-menu";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUser } from "../../../../Redux/authSlice";
import { Iuser, IuserDb } from "../interfaces/users";
import './Player.scss';
import React from 'react';
interface props {
    users: IuserDb[];
    setUsers: any;
    user: Iuser;
    usersConnected: Iuser[];
}

function Player(props : props) {
  const [connected, setConnected] = useState<boolean>(false);
  const me = useSelector(getUser);

  useEffect(() => {
    async function isConnected(user: Iuser) {
      let userFinded = props.usersConnected.find(userConnected => userConnected.userId === user.id);
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
    <div className='player' key={props.user?.id}>
      <p>{connected ? <span className="connected"></span> : <span className="disconnected"></span>} {props.user?.username}</p> 
      {
        props.user?.id === me.id ? null :
        <Menu className="playerActions" menuButton={<MenuButton>⁝</MenuButton>}> 
              <button className="actionButton">Profile</button>
              <button className="actionButton">Block</button>
              <button className="actionButton">Add friend</button>
            </Menu>
      }
    </div>
  );
}

export default Player;