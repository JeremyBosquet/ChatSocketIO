import { useDispatch, useSelector } from 'react-redux';
import '@szhsin/react-menu/dist/core.css';
import { getChannels } from '../../../Redux/chatSlice';
import { getUser } from '../../../Redux/authSlice';
import { useState } from 'react';
import './Manage.scss';
import React from 'react';

import { setChannels } from '../../../Redux/chatSlice';
import { createNotification } from '../../notif/Notif';
import instance from '../../../API/Instance';

interface props {
    channel: any;
    setToggleMenu: any;
    setManageMode: any;
}

function Manage(props: props) {
  const user = useSelector(getUser);
  const userChannels = useSelector(getChannels);

  const [visibility, setVisibility] = useState<string>(props.channel.visibility); // or visibility
  const [password, setPassword] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");

  const dispatch = useDispatch();

  const handleChange = async () => {
    if (props.channel.visibility === "protected"){
      if (!oldPassword){
        createNotification('error', 'You must enter the old password.');
        return ;
      } 
    }
    if (visibility === "protected"){
      if (!password) {
        createNotification('error', 'You must enter a password.');
        return ;
      }
    }

    const removePassword = (visibility === "public") ? true : false;

    await instance.post("chat/channel/edit", {
      channelId: props.channel.id,
      userId: user.uuid,
      removePassword: removePassword,
      newVisibility: visibility,
      newPassword: password,
      oldPassword: oldPassword
    }).then(res => {
      let channels = userChannels;
      let newChannel = {};
      if (visibility === "private")
        newChannel = {...props.channel, visibility: visibility, code: res.data.code};
      else if (props.channel.visibility === "private")
        newChannel = {...props.channel, visibility: visibility, code: ""};
      else
        newChannel = {...props.channel, visibility: visibility};

      const newChannels = channels.map((channel: any) => channel.id === props.channel.id ? newChannel : channel);
      dispatch(setChannels(newChannels));
      createNotification('success', "You have successfully changed the channel's visibility.");
      props.setToggleMenu(false);
      props.setManageMode(false);
    }).catch(err => {
      createNotification('error', err.response.data?.message + '.');
    });
  }

  const handleClose = () => {
    props.setToggleMenu(false);
    props.setManageMode(false);
  }

  const changeVisibility = (e : any) => {
    setVisibility(e.target.value);
  }

  return (
    <div className="manageChannel">
      <div className="manageContainer" >
        <div className="manageChannelInfos">
          <h3>Manage channel</h3>
          <span onClick={handleClose}>X</span>
        </div>
        <div className="manageVisibilityChoice">
          <form className="manageForm" onSubmit={handleChange}>
            <select className="manageChangePasswordSelect" name="visibility" value={visibility} onChange={changeVisibility}>
              <option value="public">Public</option>
              <option value="protected">Protected by password</option>
              <option value="private">Private</option>
            </select>
            
            { 
              props.channel.visibility === "protected" && visibility !== "protected" ? 
              <div>
                <input className="manageChangePasswordInput" name="oldPassword" type="text" placeholder='Old password' value={oldPassword} onChange={e => setOldPassword(e.target.value)} required></input>
              </div>
              : null 
            }
            {
              visibility === "protected" ?
              <div className='manageChangePassword'>
                  { props.channel.visibility === "protected" ? 
                  <input className="manageChangePasswordInput" name="oldPassword" type="text" placeholder='Old password' value={oldPassword} onChange={e => setOldPassword(e.target.value)} required></input>
                  : null }
                  <input className="manageChangePasswordInput" name="password" type="text" placeholder='New password' value={password} onChange={e => setPassword(e.target.value)} required></input>
                </div>
              :
              null
            }
          </form>

          <button className="manageChangeButton" onClick={handleChange}>Change</button>
      </div>
    </div>
  </div>
  );
}

export default Manage;
