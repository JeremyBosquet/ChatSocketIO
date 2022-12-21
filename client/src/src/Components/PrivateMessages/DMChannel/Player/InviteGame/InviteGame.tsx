
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUser } from "../../../../../Redux/authSlice";
import { IuserDb } from "../../interfaces/users";
import React from 'react';
import { getSockeGameChat } from "../../../../../Redux/gameSlice";

interface props {
    user: IuserDb;
}

function InviteGame(props : props) {

  const me = useSelector(getUser);
  const params = useParams();
  const navigate = useNavigate();
  const socket = useSelector(getSockeGameChat);

  const handleGame = async (targetId: string) => {
    console.log("handleGame");
    socket.emit("inviteGame", {targetId: targetId, ownId: me.uuid});
  }

  return (
    <button className="actionButton" onClick={() => handleGame(props.user.uuid)}>Invite to game</button>
  );
}

export default InviteGame;