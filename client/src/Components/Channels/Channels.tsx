import axios from 'axios';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import FormCreateChannel from '../FormCreateChannel/FormCreateChannel';
import Join from './Join/Join';
import Leave from './Leave/Leave';
import Search from './Search/Search';

interface props {
    socket: Socket | undefined;
    user: {id: string};
}

function Channels(props: props) {
    const UserId = "72e86254-9a03-46c9-9232-e86e203a2de7";
    const [searchChannel, setSearchChannel] = useState<string>("");
    const [init, setInit] = useState<boolean>(false);
    const [channels, setChannels] = useState<[]>([]);
    const [channelsFind, setChannelsFind] = useState<[]>([]);
    
    useEffect(() => {
        const getUsersChannel = async (userId: any) => {
            await axios.get("http://localhost:4000/api/chat/channels/user/" + userId)
            .then((res) => {
                if (res)
                    setChannels(res.data);
                    setInit(true);
            })
        }
        
        if (!init)
            getUsersChannel(UserId);

    }, [init])
    
    const formatedDate = (d: any) => {
        const newDate = new Date(d);
        return (newDate.toLocaleDateString());
    }

  return (
    <div className='chatPage'>
        <FormCreateChannel socket={props.socket} user={props.user} setChannels={setChannels}/>
        <Search socket={props.socket} user={{id: props.user.id}} setChannels={setChannels} searchChannel={searchChannel} setSearchChannel={setSearchChannel} setChannelsFind={setChannelsFind}/>
        {searchChannel === "" ? 
            <div>
                <h2>Your channels</h2>
                {channels.map((channel) => (
                    <div key={channel["id"]}>
                        <hr></hr>
                            <p>{channel["name"]} - {channel["visibility"]}</p>
                            <p>{formatedDate(channel["createdAt"])}</p>
                            <Leave socket={props.socket} channelId={channel["id"]} user={{id: props.user.id}} setChannels={setChannels} setSearchChannel={setSearchChannel} />
                        <hr></hr>
                    </div>
                ))}
            </div>
            :
            <div>
                <h2>Channel(s) found</h2>
                {channelsFind.map((channel) => (
                    <div key={channel["id"]}>
                        <hr></hr>
                            <p>{channel["name"]} - {channel["visibility"]}</p>
                            <p>{formatedDate(channel["createdAt"])}</p>
                            <Join socket={props.socket} channelId={channel["id"]} user={{id: props.user.id}} setChannels={setChannels} setSearchChannel={setSearchChannel} />
                        <hr></hr>
                    </div>
                ))}
            </div>
        }
    </div>
  );
}

export default Channels;
