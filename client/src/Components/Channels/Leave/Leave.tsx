import { Socket } from 'socket.io-client';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { getSelectedChannel, setSelectedChannel } from '../../../Redux/chatSlice';

interface props {
    socket: Socket | undefined;
    channelId: string;
    user: {id: string};
    setChannels: any;
    setSearchChannel: any;
    // selectedChannel: string;
    // setSelectedChannel: any;
}

function Leave(props: props) {
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
    
        await axios.post("http://localhost:4000/api/chat/channel/leave", {"channel": {id: id}, "userId": props.user.id})
        .then((res) => {
            getUsersChannel(props.user.id);
            props.socket?.emit('leavePermanant', { userId: props.user.id, channelId: id });
            props.setSearchChannel("");
            // if (props.selectedChannel === id)
            //     props.setSelectedChannel("");
            if (selectedChannel === id)
                dispatch(setSelectedChannel(id));
        })
    }
    
  return (
    <>
        <button className='leaveChannelButton' onClick={e => handleLeave(props.channelId)}>Leave</button>
    </>
  );
}

export default Leave;
