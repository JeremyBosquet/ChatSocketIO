
import { useState } from 'react';
import { getUser } from '../../Redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket, setChannels } from '../../Redux/chatSlice';
import React from 'react';
import { createNotification } from '../notif/Notif';
import './FormCreateChannel.scss';
import { IoAdd } from 'react-icons/io5';
import instance from '../../API/Instance';

function FormCreateChannel() {
  const [channelName, setChannelName] = useState<string>("");
  const [visibility, setVisibility] = useState<string>("public");
  const [password, setPassword] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const dispatch = useDispatch();

  const socket = useSelector(getSocket);
  const user = useSelector(getUser);

  function checkVisibility(visibility : string) {
    if (visibility === "public" || visibility === "private" || visibility === "protected")
      return (true);
    else {
      createNotification("error", "Channel's visibility can only be (public, private or protected).");
      return (false);
    }
    
  }

  function checkPassword(password: string) {
    if (visibility === "protected")
    {
      if (password.length < 8)
      {
        createNotification("error", "Password require minimum 8 characters.");
        return (false);
      }
    }
    return (true);
  }

  const changeVisibility = (e : any) => {
    setPassword("");
    setVisibility(e.target.value);
  }

  const handleSubmit = async (e : any) => {
    e.preventDefault(); // Cancel the form submit event 

    if (channelName === "") // Check if the name is empty
    {
      createNotification("error", "channel's name can't be empty");
      return ;
    }

    if (!checkPassword(password)) // check password force
      return ;

    if (!checkVisibility(visibility)) // Check channel's visibility is valid
      return ;

    const defaultUsers = [
      {
        id: user.uuid,
        role: "owner"
      }
    ]

    instance.post('chat/channel', { name: channelName, owner: {id: user.uuid}, visibility: visibility, password: password, users: defaultUsers, messages: [], mutes: [], bans: [] })
    .then((res : any) => {
      if (res.data ) {
        createNotification("success", "You have successfully created " + channelName + " channel.");
        socket?.emit('channelCreated');

        const getUsersChannel = async (userId: any) => {
          await instance.get("chat/channels/user/" + userId)
          .then((res) => {
              if (res)
                  dispatch(setChannels(res.data));
          })
        }

        getUsersChannel(user.uuid);
        
        //Reset form
        setChannelName("");
        setVisibility("public");
        setPassword("");
        setOpen(false);
      }
    }
    ).catch((error : any) => {
        if (error) {
          createNotification("error", "Please retry later. (" + error +")");
        }
      }
    )
  }

  return (
    <>
      <button className='createChannelButton' onClick={() => setOpen(true)}><IoAdd className='createChannelIcons' /></button>
      {
        open ? (
          <div className='CreateChannel'>
            <div className='CreateChannelContainer'>
              <div className='CreateChannelInfos'>
                <p className="FormCreateChannelTitle">Create a channel</p>
                <p className="FormCreateChannelClose" onClick={() => setOpen(false )}>X</p>
              </div>
              <form className="ChannelCreateForm" onSubmit={handleSubmit}>
                <input className="FormCreateChannelInput" type="text" value={channelName} onChange={e => setChannelName(e.target.value)} placeholder="Channel's name" required></input>
                <select className="FormCreateChannelSelect" name="visibility" value={visibility} onChange={changeVisibility}>
                  <option value="public">Public</option>
                  <option value="protected">Protected by password</option>
                  <option value="private">Private</option>
                </select>
                {visibility === "protected" ? (
                  <input className="FormCreateChannelInput" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Channel's password" required></input>
                ) : null}
                <button className="FormCreateChannelButton" type="submit">Create channel</button>
              </form>
            </div>
          </div>
      ) : null}
  </>
  );
}

export default FormCreateChannel;
