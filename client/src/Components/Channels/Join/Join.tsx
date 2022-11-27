import axios from 'axios';import { useState } from 'react';
import { getUser } from '../../../Redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket, setChannels } from '../../../Redux/chatSlice';
import React from 'react';
import { createNotification } from '../../notif/Notif';
import './Join.scss';

interface props {
    channelId: string;
    channelVisibility: string;
    setSearchChannel: any;
}

function Join(props: props) {
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");

    const dispatch = useDispatch();
    
    const user = useSelector(getUser);
    const socket = useSelector(getSocket);

    const handleJoin = async (id: string) => {
        setError("");

        if (props.channelVisibility === "protected")
            if (password === "")
                return;

        if (props.channelVisibility === "private")
        {
            setError("You can't join this channel, please use code.");
            return;
        }
                
        const getUsersChannel = async (userId: any) => {
            await axios.get("http://90.66.192.148:7000/api/chat/channels/user/" + userId)
            .then((res) => {
                if (res)
                    dispatch(setChannels(res.data));
            })
        }
    
        await axios.post("http://90.66.192.148:7000/api/chat/channel/join", {"channelId": id, "userId": user.uuid, "password": password})
        .then(() => {
            getUsersChannel(user.uuid);
            socket?.emit('joinPermanent', { channelId: id });
            createNotification("success", "You have successfully join the channel.");
            props.setSearchChannel("");
        }).catch((err) => {
            setError(err.response.data.message);
        })}
    
  return (
    <>
        {
            props.channelVisibility === "protected" ?
            <>
                { error !== "" ? <p>Error: {error}</p> : null }
                <input placeholder="password" value={password} onChange={e => setPassword(e.target.value)}></input>
                <button className='joinChannelButton' onClick={e => handleJoin(props.channelId)}>Join</button>
            </>
            :
            <>
                { error !== "" ? <p>Error: {error}</p> : null }
                <button className='joinChannelButton' onClick={e => handleJoin(props.channelId)}>Join</button>
            </>
        }
    </>
  );
}

export default Join;
