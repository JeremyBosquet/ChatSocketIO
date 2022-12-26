
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUser } from "../../../../../Redux/userSlice";
import { IuserDb } from "../../interfaces/users";
import React from 'react';
import instance from "../../../../../API/Instance";

interface props {
    user: IuserDb;
}

function DM(props : props) {

  const me = useSelector(getUser);
  const params = useParams();
  const navigate = useNavigate();

  const handleDM = async (targetId: string) => {
    if (!params.id)
      navigate('/chat/channel');

    await instance.post(`chat/dm/`, {
      user1: me.uuid,
      user2: targetId,
    }).then(res => {
      if (res.data.id)
        navigate(`/chat/dm/${res.data.id}`);
    });
  }

  return (
    <button className="actionButton" onClick={() => handleDM(props.user.uuid)}>DM</button>
  );
}

export default DM;