
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUser } from "../../../../../Redux/userSlice";
import { getSocket } from "../../../../../Redux/chatSlice";
import { IuserDb } from "../../interfaces/users";
import React from 'react';
import { createNotification } from "../../../../notif/Notif";
import instance from "../../../../../API/Instance";

interface props {
    user: IuserDb;
}

function Kick(props : props) {
  const socket = useSelector(getSocket);
  const me = useSelector(getUser);
  const params = useParams();
  const navigate = useNavigate();
  const selectedChannel = params.id || "";

  const handleKick = async (targetId: string) => {
    if (!params.id)
      navigate('/chat/channel');

    await instance.post(`chat/channel/kick/`, {
      channelId: selectedChannel,
      target: targetId,
    }).then(() => {
      socket?.emit("kick", {channelId: selectedChannel, target: targetId, type: "kick"});
      createNotification('success', 'You have successfully kicked the player.');
    });
  }

  return (
    <button className="actionButton" onClick={e => handleKick(props.user.uuid)}>Kick</button>
  );
}

export default Kick;