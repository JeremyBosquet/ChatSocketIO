import { Menu, MenuButton } from "@szhsin/react-menu";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getBlockList, getUser } from "../../../../Redux/authSlice";
import { Iuser, IuserDb } from "../interfaces/users";
import Admin from "./Admin/Admin";
import Ban from "./Ban/Ban";
import DM from "./DM/DM";
import InviteGame from "./InviteGame/InviteGame";
import Kick from "./Kick/Kick";
import Mute from "./Mute/Mute";
import React from 'react';
import './Player.scss';
import { getSockeGameChat } from "../../../../Redux/gameSlice";
import { Link } from "react-router-dom";
import Block from "./Block/Block";
import AddRemoveFriend from "./AddRemoveFriend/AddRemoveFriend";

interface IInvites {
  requestFrom: string;
  roomId: string;
}
interface props {
    users: IuserDb[];
    setUsers: any;
    user: IuserDb;
    usersConnected: Iuser[];
    mutedUsers: [];
    invites: IInvites[];
}

function Player(props : props) {
  const [connected, setConnected] = useState<boolean>(false);
  const me = useSelector(getUser);
  const socketGame = useSelector(getSockeGameChat);

  useEffect(() => {
    async function isConnected(user: IuserDb) {
      let userFinded = props.usersConnected.find(userConnected => userConnected.userId === user.uuid);
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

  const hasInvited = (userId: string) => {
    let invite = props.invites.find((u: any) => u.requestFrom === userId);
    if (invite)
      return (true);
    return (false);
  }
  
  const handleAcceptInvitation = (userId: string) => {
    let invite = props.invites.find((u: any) => u.requestFrom === userId);
    if (invite)
    {
      socketGame.emit('joinInviteGame', {
        roomId: invite.roomId,
        playerId: me.uuid,
        playerName: me.username
      });
    }
  }

  return (
    <div className='player' key={props.user?.uuid}>
      <div style={{display: "flex"}}>
        {connected ? <span className="connected"></span> : <span className="disconnected"></span>}
        <p style={{maxWidth: "auto", overflow: "hidden", textOverflow: "ellipsis"}}>{props.user?.username}</p>
      </div>
      {
        me?.uuid !== props.user?.uuid && hasInvited(props.user?.uuid) ?
          <button className='playerAcceptInvitation' onClick={() => handleAcceptInvitation(props.user?.uuid)}>Accept invitation</button>
          :
          null
      }
      {
        props.user?.uuid === "" ? null :
        <Menu 
          viewScroll="close"
          className="playerActions" 
          onKeyDown={(e) => e.stopPropagation()}
          menuButton={<MenuButton>⁝</MenuButton>}
        >
              {(me.role === "admin" && 
                props.user.role !== 'admin' && 
                props.user.role !== 'owner') ?
                  <>
                    <Ban user={props.user} />
                    <Kick user={props.user} />
                    <Mute user={props.user} mutedUsers={props.mutedUsers}/>
                  </>
                : (me.role === "owner") ? 
                  <>
                    <Ban user={props.user} />
                    <Kick user={props.user} />
                    <Mute user={props.user} mutedUsers={props.mutedUsers}/>
                    <Admin user={props.user} users={props.users} setUsers={props.setUsers}/>
                  </>
                : null
              }
              <DM user={props.user}/>
              { connected ? <InviteGame user={props.user}/> : null }
              <Link to={"/profile/" + props.user.trueUsername} className="actionButton">Profile</Link>
              <Block user={props.user}/>
              <AddRemoveFriend user={props.user}/>
            </Menu>
      }
    </div>
  );
}

export default Player;