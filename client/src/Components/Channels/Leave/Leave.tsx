import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { getSocket, setChannels } from '../../../Redux/chatSlice';
import { getUser } from '../../../Redux/authSlice';
import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { createNotification } from '../../notif/Notif';

interface props {
    channelId: string;
    setSearchChannel: any;
}

function Leave(props: props) {
    const user = useSelector(getUser);
    const socket = useSelector(getSocket);
    const dispatch = useDispatch()

    const params = useParams();
    const navigate = useNavigate();

    const handleLeave = async (id: string) => {
        const getUsersChannel = async (userId: any) => {
            await axios.get("http://90.66.192.148:7000/api/chat/channels/user/" + userId)
            .then((res) => {
                if (res)
                    dispatch(setChannels(res.data));
            })
        }
    
        await axios.post("http://90.66.192.148:7000/api/chat/channel/leave", {"channelId": id, "userId": user.uuid})
        .then((res) => {
            getUsersChannel(user.uuid);
            socket?.emit('leavePermanant', { userId: user.uuid, channelId: id });
            props.setSearchChannel("");
            createNotification('success', 'You have successfully left the channel.');
            if (params.id === id)
                navigate('/chat/channel');
        })
    }
    
  return (
    <>
        <button className='leaveChannelButton' onClick={e => handleLeave(props.channelId)}>Leave</button>
    </>
  );
}

export default Leave;
