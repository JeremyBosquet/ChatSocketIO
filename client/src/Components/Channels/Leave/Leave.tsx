import { Socket } from 'socket.io-client';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { getSelectedChannel, setSelectedChannel } from '../../../Redux/chatSlice';
import { getUser } from '../../../Redux/authSlice';

interface props {
    socket: Socket | undefined;
    channelId: string;
    setChannels: any;
    setSearchChannel: any;
}

function Leave(props: props) {
    const user = useSelector(getUser);
    const selectedChannel = useSelector(getSelectedChannel);
    const dispatch = useDispatch()

    const handleLeave = async (id: string) => {
        const getUsersChannel = async (userId: any) => {
            await axios.get("http://localhost:4000/api/chat/channels/user/" + userId)
            .then((res) => {
                if (res)
                    props.setChannels(res.data);
            })
        }
    
        await axios.post("http://localhost:4000/api/chat/channel/leave", {"channelId": id, "userId": user.id})
        .then((res) => {
            getUsersChannel(user.id);
            props.socket?.emit('leavePermanant', { userId: user.id, channelId: id });
            props.setSearchChannel("");
            if (selectedChannel === id)
                dispatch(setSelectedChannel(""));
        })
    }
    
  return (
    <>
        <button className='leaveChannelButton' onClick={e => handleLeave(props.channelId)}>Leave</button>
    </>
  );
}

export default Leave;
