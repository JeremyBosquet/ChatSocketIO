import { Socket } from 'socket.io-client';
import Join from '../Join/Join';
import Leave from '../Leave/Leave';
import { Menu, MenuButton } from '@szhsin/react-menu';
import { useSelector, useDispatch } from 'react-redux';
import '@szhsin/react-menu/dist/core.css';
import { getSelectedChannel, setSelectedChannel } from '../../../Redux/chatSlice';
import { getUser } from '../../../Redux/authSlice';
import { useState } from 'react';
import './Manage.scss';
import axios from 'axios';

interface props {
    socket: Socket | undefined;
    channel: any;
    channels: any;
    setToggleMenu: any;
    setManageMode: any;
    setChannels: any;
}

function Manage(props: props) {
  const user = useSelector(getUser);

  const [visibility, setVisibility] = useState<string>(props.channel.visibility); // or visibility
  const [password, setPassword] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");

  const handleChange = async () => {
    if (visibility === "protected" && props.channel.visibility === "protected")
      if (!oldPassword)
        return ;

    const removePassword = (visibility === "public") ? true : false;

    await axios.post("http://localhost:4000/api/chat/channel/edit", {
      channelId: props.channel.id,
      userId: user.id,
      removePassword: removePassword,
      newVisibility: visibility,
      newPassword: password,
      oldPassword: oldPassword
    }).then(res => {
      let channels = props.channels;
      props.channel.visibility = visibility;
      channels[props.channels.find((channel: any) => channel.id === props.channel.id)] = props.channel;
    }).catch(err => console.log(err));

    props.setToggleMenu(false);
    props.setManageMode(false);
  }

  return (
    <div className='manageChannel' style={{zIndex: 999}}>
      <div>
        <h3>Manage channel</h3>
      </div>
      <div style={
        { display: 'flex',
          flexDirection: 'column',}
      }>
        <p>Change visibility</p>
        <label>Private</label>
        <input type="radio" name="Private" value="private" checked={visibility === 'private'} onChange={e => setVisibility("private")}/>
        <label>Protected</label>
        <input type="radio" name="Protected" value="protected" checked={visibility === 'protected'} onChange={e => setVisibility("protected")}/>
        <label>Public</label>
        <input type="radio" name="Public" value="public" checked={visibility === 'public'} onChange={e => setVisibility("public")}/>
      </div>
      {
        visibility === "protected" ?
        <div>
            <p>Change password</p>
            { props.channel.visibility === "protected" ? 
              <>
                <input name="oldPassword" type="text" placeholder='Old password' value={oldPassword} onChange={e => setOldPassword(e.target.value)}></input>
                <input name="password" type="text" placeholder='New password' value={password} onChange={e => setPassword(e.target.value)}></input>
              </>
              :
                <input name="password" type="text" placeholder='New password' value={password} onChange={e => setPassword(e.target.value)}></input>
            }
          </div>
        :
        null
      }
      <button onClick={handleChange} >Change</button>
    </div>
  );
}

export default Manage;
