import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { getUser } from "../../../../../Redux/authSlice";
import { getSocket } from "../../../../../Redux/chatSlice";
import { IuserDb } from "../../interfaces/users";
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import './Ban.scss'
import { useNavigate, useParams } from "react-router-dom";
import React from 'react';

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

  const handleBan = async (targetId: string) => {
    if (!params.id)
      navigate('/chat/channel');

    if (!value)
      onChange(new Date());
    
    let permanent = time === "permanent" ? true : false;
    // const newDate = new Date(value.setHours(value.getHours() + 1));
    let duration = value?.toISOString();


    await axios.post(`http://90.66.192.148:7000/api/chat/channel/ban/`, {
      channelId: selectedChannel,
      target: targetId,
      admin: me.id,
      time: duration,
      isPermanent: permanent
    }).then(res => {
      socket?.emit("kick", {channelId: selectedChannel, target: targetId, type: "ban"});
    });
  }

  const handleClose = () => {
    setBanMenu(false);
    // props.setManageMode(false);
  }

  return (
    <>
      { banMenu ?
          <div className="banMenu">
            <div className="banContainer">
              <div className="banInfos">
                <h3>Ban {props.user.name}</h3>
                <span onClick={handleClose}>X</span>
              </div>
              <div className="banDuration">
                <h4>Duration</h4>
                <form>
                  <input type="radio" name="permanent" value="permanent" onChange={e => setTime("permanent")} checked={time === "permanent"}/>
                  <label htmlFor="permanent">Permanent</label>
                  <input type="radio" name="temporary" value="temporary" onChange={e => setTime("temporary")} checked={time === "temporary"}/>
                  <label htmlFor="temporary">Temporary</label>
                </form>
              </div>
              {
                time === "temporary" ?
                <DateTimePicker 
                  disableClock={true} 
                  clearIcon={null} 
                  format="dd/MM/y - h:mm a" 
                  dayPlaceholder="DD"
                  monthPlaceholder="MM"
                  yearPlaceholder="Y"
                  minutePlaceholder="Minute" 
                  hourPlaceholder="Hour"
                  closeWidgets={false}
                  locale="fr"
                  minDate={new Date()} 
                  onChange={onChange}
                  value={value}
                  

                  className="datePicker" 
                  required />
                  : null
              }
              <button onClick={() => handleBan(props.user.id)}>Ban</button>
            </div>
          </div>
      : null
    }
      <button className="actionButton" onClick={() => setBanMenu(!banMenu)}>Ban</button>
    </>
  );
}

export default Ban;