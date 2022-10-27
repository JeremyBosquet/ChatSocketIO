import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { getSelectedChannel, getSocket, setChannels, setSelectedChannel } from '../../../Redux/chatSlice';
import { getUser } from '../../../Redux/authSlice';

interface props {
    channelId: string;
    setSearchChannel: any;
}

function Leave(props: props) {
    const user = useSelector(getUser);
    const socket = useSelector(getSocket);
    const selectedChannel = useSelector(getSelectedChannel);
    const dispatch = useDispatch()

    const handleLeave = async (id: string) => {
        const getUsersChannel = async (userId: any) => {
            await axios.get("http://localhost:4000/api/chat/channels/user/" + userId)
            .then((res) => {
                if (res)
                    dispatch(setChannels(res.data));
            })
        }
    
        await axios.post("http://localhost:4000/api/chat/channel/leave", {"channelId": id, "userId": user.id})
        .then((res) => {
            getUsersChannel(user.id);
            socket?.emit('leavePermanant', { userId: user.id, channelId: id });
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
