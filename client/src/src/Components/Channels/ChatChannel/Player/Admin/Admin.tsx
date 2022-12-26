
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
    users: IuserDb[];
    setUsers: any;
}

function Admin(props : props) {

  const socket = useSelector(getSocket);
  const me = useSelector(getUser);

  const params = useParams();
  const navigate = useNavigate();
  const selectedChannel = params.id || "";

  
  const setAdmin = async (targetId: string) => {
    if (!params.id)
      navigate('/chat/channel');

    await instance.post(`chat/channel/setadmin/`, {
      channelId: selectedChannel,
      target: targetId,
    }).then(() => {
      props.setUsers(props.users.map(user => {
        if (user.uuid === targetId)
          user.role = "admin";
          return user;
        }));
        
        socket?.emit("admin", {channelId: selectedChannel, target: targetId, type: "promote"});
        createNotification('success', 'You have successfully set the user as admin role.');
      });
  }

  const unsetAdmin = async (targetId: string) => {
    await instance.post(`chat/channel/unsetadmin/`, {
      channelId: selectedChannel,
      target: targetId,
    }).then(() => {
      props.setUsers(props.users.map(user => {
        if (user.uuid === targetId)
          user.role = "default";
        return user;
      }));

      socket?.emit("admin", {channelId: selectedChannel, target: targetId, type: "downgrade"});
      createNotification('success', 'You have successfully set the user as default role.');
    });
  }

  return (
    <>
      {
        props.user.role === "admin" ?
          <button className="actionButton" onClick={() => unsetAdmin(props.user.uuid)}>Unset Admin</button> 
        :
          <button className="actionButton" onClick={() => setAdmin(props.user.uuid)}>Set Admin</button>
      }
    </>
  );
}

export default Admin;