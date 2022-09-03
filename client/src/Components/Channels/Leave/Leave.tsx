import { Socket } from 'socket.io-client';
import axios from 'axios';;

interface props {
    socket: Socket | undefined;
    channelId: string;
    user: {id: string};
    setChannels: any;
    setSearchChannel: any;
}

function Leave(props: props) {

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
            props.setSearchChannel("");
        })
    }
    
  return (
    <>
        <button className='leaveChannelButton' onClick={e => handleLeave(props.channelId)}>Leave</button>
    </>
  );
}

export default Leave;
