import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { getUser } from "../../../../../Redux/authSlice";
import { getSocket } from "../../../../../Redux/chatSlice";
import { IuserDb } from "../../interfaces/users";
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import './Ban.scss'
import { useNavigate, useParams } from "react-router-dom";
import React from 'react';
import { createNotification } from "../../../../notif/Notif";
import DatePicker from "../DatePicker/DatePicker";

interface props {
    user: IuserDb;
}

function Ban(props : props) {
  const [value, onChange] = useState<Date>(new Date());
  const socket = useSelector(getSocket);
  const me = useSelector(getUser);

  const params = useParams();
  const navigate = useNavigate();
  const selectedChannel = params.id || "";

  const [time, setTime] = useState<string>("permanent");
  const [banMenu, setBanMenu] = useState(false);

  const handleBan = async (e: any, targetId: string) => {
    e.preventDefault();
    
    if (!params.id)
      navigate('/chat/channel');

    if (!value)
      onChange(new Date());
    
    let permanent = time === "permanent" ? true : false;
    let duration = value?.toISOString();


    await axios.post(`http://192.168.1.53:7000/api/chat/channel/ban/`, {
      channelId: selectedChannel,
      target: targetId,
      admin: me.uuid,
      time: duration,
      isPermanent: permanent
    }).then(() => {
      socket?.emit("kick", {channelId: selectedChannel, target: targetId, type: "ban"});
      if (permanent)
        createNotification('success', 'You have permanently banned the player.');
      else
        createNotification('success', 'You have successfully ban the player until ' + value.toLocaleDateString() + " at " + value.getHours() + ":" + value.getMinutes() + '.');
    });
  }

  const handleClose = () => {
    setBanMenu(false);
  }
  
  const changeTime = (e: any) => {
    setTime(e.target.value);
  }

  return (
    <>
      { banMenu ?
          <div className="banMenu">
            <div className="banContainer">
              <div className="banInfos">
                <h3>Ban {props.user.username}</h3>
                <span onClick={() => handleClose()}>X</span>
              </div>
              <div className="banDuration" onSubmit={(e) => handleBan(e, props.user.uuid)}>
                <form className="banForm">
                  <select className="banSelect" name="time" value={time} onChange={changeTime}>
                    <option value="permanent">Permanent</option>
                    <option value="temporary">Temporary</option>
                  </select>
                  {
                    time === "temporary" ?
                      <DatePicker value={value} onChange={onChange} />
                      : null
                  }
                  <button className="banButton" type="submit">Ban</button>
                </form>
              </div>
            </div>
          </div>
      : null
    }
      <button className="actionButton" onClick={() => setBanMenu(!banMenu)}>Ban</button>
    </>
  );
}

export default Ban;