
import { useState } from "react";
import { useSelector } from "react-redux";
import { getUser } from "../../../../../Redux/authSlice";
import { getSocket } from "../../../../../Redux/chatSlice";
import { IuserDb } from "../../interfaces/users";
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import './Mute.scss'
import { useNavigate, useParams } from "react-router-dom";
import React from 'react';
import { createNotification } from "../../../../notif/Notif";
import DatePicker from "../DatePicker/DatePicker";
import instance from "../../../../../API/Instance";

interface props {
    user: IuserDb;
    mutedUsers: [];
}

function Mute(props : props) {
  const [value, onChange] = useState<Date>(new Date());
  const me = useSelector(getUser);
  const socket = useSelector(getSocket);

  const params = useParams();
  const navigate = useNavigate();
  const selectedChannel = params.id || "";

  const [time, setTime] = useState<string>("permanent");
  const [muteMenu, setMuteMenu] = useState(false);

  const handleMute = async (e: any, targetId: string) => {
    e.preventDefault();
    if (!params.id)
      navigate('/chat/channel');

    if (isMuted()){ //unmute
      await instance.post(`chat/channel/unmute/`, {
        channelId: selectedChannel,
        target: targetId,
        admin: me.uuid,
      }).then(() => {
        socket.emit("mute", {channelId: selectedChannel, target: targetId});
        setMuteMenu(false);
        createNotification('success', 'You have successfully umuted the player.');
      });

      return ;
    }
    
    if (!value)
      onChange(new Date());
    
    let permanent = time === "permanent" ? true : false;
    let duration = value?.toISOString();

    await instance.post(`chat/channel/mute/`, {
      channelId: selectedChannel,
      target: targetId,
      admin: me.uuid,
      time: duration,
      isPermanent: permanent
    }).then(() => {
      socket.emit("mute", {channelId: selectedChannel, target: targetId});
      setMuteMenu(false);
      if (permanent)
        createNotification('success', 'You have permanently muted the player.');
      else
        createNotification('success', 'You have successfully muted the player until ' + value.toLocaleDateString() + " at " + value.getHours() + ":" + value.getMinutes() + '.');
    });
  }

  const handleClose = () => {
    setMuteMenu(false);
    // props.setManageMode(false);
  }

  const isMuted = () => {
    if (props.mutedUsers.filter((user: any) => user.id === props.user.uuid).length > 0)
      return true;
    return false;
  }
  
  const changeTime = (e: any) => {
    setTime(e.target.value);
  }

  return (
    <>
      { muteMenu ?
          <div className="muteMenu">
            <div className="muteContainer">
              <div className="muteInfos">
                <h3>Mute {props.user.username}</h3>
                <span onClick={handleClose}>X</span>
              </div>
              <div className="muteDuration">
                <form className="muteForm" onSubmit={(e) => handleMute(e, props.user.uuid)}>
                  <select className="muteSelect" name="time" value={time} onChange={changeTime}>
                    <option value="permanent">Permanent</option>
                    <option value="temporary">Temporary</option>
                  </select>
                  {
                    time === "temporary" ?
                      <DatePicker value={value} onChange={onChange} />
                      : null
                  }
                  <button className="muteButton" type="submit">Mute</button>
                </form>
              </div>
            </div>
          </div>
      : null
    }
      {
        isMuted() ?
          <button className="actionButton" onClick={(e) => handleMute(e, props.user.uuid)}>Unmute</button>
        :
          <button className="actionButton" onClick={() => setMuteMenu(!muteMenu)}>Mute</button>
      }
    </>
  );
}

export default Mute;