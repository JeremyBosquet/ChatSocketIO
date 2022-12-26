import { Menu, MenuButton } from "@szhsin/react-menu";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getBlockedByList, getBlockList, getUser } from "../../../../Redux/userSlice";
import { Iuser, IuserDb } from "../interfaces/users";
// import './Player.scss';
import React from 'react';
import { Link } from "react-router-dom";
import Block from "./Block/Block";
import AddRemoveFriend from "./AddRemoveFriend/AddRemoveFriend";
import InviteGame from "./InviteGame/InviteGame";
import { getSockeGameChat } from "../../../../Redux/gameSlice";

interface IInvites {
  requestFrom: string;
  roomId: string;
}

interface props {
    users: IuserDb[];
    setUsers: any;
    user: IuserDb;
    usersConnected: Iuser[];
    invites: IInvites[];
}

function Player(props : props) {
  const [connected, setConnected] = useState<boolean>(false);
  const me = useSelector(getUser);
  const socketGame = useSelector(getSockeGameChat);
  const blockList = useSelector(getBlockList);
  const blockedByList = useSelector(getBlockedByList);
  const [blocked, setBlocked] = useState<boolean>(false);
  const [blockedBy, setBlockedBy] = useState<boolean>(false);

  async function isBlocked(user: IuserDb) {
    let userFinded = blockList.find((blockedUser: any) => blockedUser.uuid === user.uuid);
    if (userFinded)
    {
      setBlocked(true);
      return (true);
    }
    setBlocked(false);
    return (false);
  }

  async function isBlockedBy(user: IuserDb) { //TODO a faire quand adonis aura fait la blockByList
    let userFinded = blockedByList.find((blocked: any) => blocked.uuid === user.uuid);
    if (userFinded)
    {
      setBlockedBy(true);
      return (true);
    }
    setBlockedBy(false);
    return (false);
  }

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

    isBlocked(props.user);
    isBlockedBy(props.user);
    isConnected(props.user);
    //eslint-disable-next-line
  }, [props.usersConnected])

  useEffect(() => {
    isBlocked(props.user);
  }, [blockList])

  useEffect(() => {
    isBlockedBy(props.user);
  }, [blockedByList])

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

  const usernameTrunc = (username: string) => {
    function addSpace() {
      let spaces = "";  

      for (let i = 0; i <= (7 - username.length); i++)
        spaces += '\xa0';
      return (spaces);
    }

    if (me?.uuid !== props.user?.uuid && hasInvited(props.user.uuid)) {
      if (username.length >= 5)
        return (username.substring(0, 5) + '..');
      return (username + addSpace());
    }
    return (username);
  }
  
  return (
    <div className='player' key={props.user?.uuid}>
      <div style={{display: "flex"}}>
        {connected && !blocked && !blockedBy ? <span className="connected"></span> : <span className="disconnected"></span>}
        <p style={{maxWidth: "auto", overflow: "hidden", textOverflow: "ellipsis"}}>{usernameTrunc(props.user?.username)}</p>
      </div>
      <div className="playerGroupActions">
       {
          me?.uuid !== props.user?.uuid && hasInvited(props.user?.uuid) ?
            <button className='playerAcceptInvitation' onClick={() => handleAcceptInvitation(props.user?.uuid)}>Accept invitation</button>
            :
            null
        }
        {
          props.user?.uuid === me.uuid ? null :
          <Menu 
            viewScroll="close"
            className="playerActions" 
            onKeyDown={(e) => e.stopPropagation()}
            menuButton={<MenuButton>⁝</MenuButton>}
          >
            { connected && !blocked && !blockedBy && !hasInvited(props.user?.uuid) ? <InviteGame user={props.user}/> : null }
            <Link to={"/profile/" + props.user.trueUsername} className="actionButton">Profile</Link>
            <Block user={props.user}/>
            <AddRemoveFriend user={props.user}/>
          </Menu>
        }
      </div>
    </div>
  );
}

export default Player;