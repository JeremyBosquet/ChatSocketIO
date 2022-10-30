import { useDispatch, useSelector } from 'react-redux';
import '@szhsin/react-menu/dist/core.css';
import { getChannels } from '../../../Redux/chatSlice';
import { getUser } from '../../../Redux/authSlice';
import { useState } from 'react';
import './Manage.scss';
import axios from 'axios';
import { setChannels } from '../../../Redux/chatSlice';

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

  const [error, setError] = useState<string>("");

  const handleChange = async () => {
    if (props.channel.visibility === "protected"){
      if (!oldPassword){
        setError("Error: You must enter the old password");
        return ;
      } 
    }
    if (visibility === "protected"){
      if (!password) {
        setError("Error: You must enter a password");
        return ;
      }
    }

    const removePassword = (visibility === "public") ? true : false;

    await axios.post("http://localhost:4000/api/chat/channel/edit", {
      channelId: props.channel.id,
      userId: user.id,
      removePassword: removePassword,
      newVisibility: visibility,
      newPassword: password,
      oldPassword: oldPassword
    }).then(res => {
      let channels = userChannels;
      const newChannel = {...props.channel, visibility: visibility};
      const newChannels = channels.map((channel: any) => channel.id === props.channel.id ? newChannel : channel);
      dispatch(setChannels(newChannels));
      // channels[userChannels.find((channel: any) => channel.id === props.channel.id)] = newChannel;
      props.setToggleMenu(false);
      props.setManageMode(false);
    }).catch(err => {
      setError("Error: " + err)
    });
  }

  const handleClose = () => {
    props.setToggleMenu(false);
    props.setManageMode(false);
  }

  return (
    <div className="manageChannel">
      <div className="manageContainer" >
        <div className="manageChannelInfos">
          <h3>Manage channel</h3>
          <span onClick={handleClose}>X</span>
        </div>
        <div className="manageVisibilityChoice">
          <p>Change visibility</p>
          <div className="manageVisibilityItem" >
            <input type="checkbox" name="Private" value="private" onChange={e => setVisibility("private")} checked={visibility === "private"}/>
            <label>Private</label>
          </div>
          <div className="manageVisibilityItem" >
            <input type='checkbox' name="Protected" value="protected" onChange={e => setVisibility("protected")} checked={visibility === "protected"} />
            <label>Protected</label>
          </div>
          <div className="manageVisibilityItem">
            <input type="checkbox" name="Public" value="public" onChange={e => setVisibility("public")} checked={visibility === "public"} />
            <label>Public</label>
          </div>
        </div>
        { props.channel.visibility === "protected" && visibility !== "protected" ? 
          <div>
            <p>Old password</p>
            <input className="manageChangePasswordButton" name="oldPassword" type="text" placeholder='Old password' value={oldPassword} onChange={e => setOldPassword(e.target.value)}></input>
          </div>
          : null }
        {
          visibility === "protected" ?
          <div className='manageChangePassword'>
            <p>Change password</p>
              { props.channel.visibility === "protected" ? 
              <input className="manageChangePasswordButton" name="oldPassword" type="text" placeholder='Old password' value={oldPassword} onChange={e => setOldPassword(e.target.value)}></input>
              : null }
              <input className="manageChangePasswordButton" name="password" type="text" placeholder='New password' value={password} onChange={e => setPassword(e.target.value)}></input>
            </div>
          :
          null
        }
        { error ? <p>{error}</p> : null }
        <button className="manageChangeButton" onClick={handleChange}>Change</button>
      </div>
    </div>
  );
}

export default Manage;
