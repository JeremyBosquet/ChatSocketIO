import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUser } from "../../../../../Redux/authSlice";
import { IuserDb } from "../../interfaces/users";
import React from 'react';

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

    await axios.post(`http://90.66.192.148:7000/api/chat/dm/`, {
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