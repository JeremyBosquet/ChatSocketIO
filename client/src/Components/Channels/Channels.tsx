import axios from 'axios';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import FormCreateChannel from '../FormCreateChannel/FormCreateChannel';
import Channel from './Channel/Channel';
import Search from './Search/Search';
import './Channels.scss';
import ChatChannel from './ChatChannel/ChatChannel';
import { useSelector } from 'react-redux';
import { getSelectedChannel } from '../../Redux/chatSlice';
import { getUser } from '../../Redux/authSlice';

interface props {
    socket: Socket | undefined;
}

function Channels(props: props) {
    const [searchChannel, setSearchChannel] = useState<string>("");
    const [init, setInit] = useState<boolean>(false);
    const [channels, setChannels] = useState<[]>([]);
    const [channelsFind, setChannelsFind] = useState<[]>([]);
    
    const user = useSelector(getUser);
    const selectedChannel = useSelector(getSelectedChannel);
    
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
            getUsersChannel(user.id);
        //eslint-disable-next-line
    }, [init])

    return (
    <div className='channels'>
        <div className='channelsOperations'>
            <FormCreateChannel socket={props.socket} setChannels={setChannels}/>
            <Search socket={props.socket} setChannels={setChannels} searchChannel={searchChannel} setSearchChannel={setSearchChannel} setChannelsFind={setChannelsFind}/>
        </div>
        <div className='channelInfos'>
            {searchChannel === "" ? 
                <div className='channelInfo'>
                    <h2>Your channels</h2>
                    {channels.map((channel) => (
                        <Channel key={channel["id"]} socket={props.socket} channel={channel} channels={channels} setChannels={setChannels} setSearchChannel={setSearchChannel} foundChannel={false}/>
                    ))}
                </div>
                :
                <div className='channelInfo'>
                    <h2>Channel(s) found</h2>
                    {channelsFind.map((channel) => (
                        <Channel key={channel["id"]} socket={props.socket} channel={channel} channels={channels} setChannels={setChannels} setSearchChannel={setSearchChannel} foundChannel={true}/>
                    ))}
                </div>
            }
            <div className='channelChat'>
                { selectedChannel !== "" ? 
                    <ChatChannel socket={props.socket} />
                        :
                    <p>Select a channel</p>
                }
            </div>
        </div>
    </div>
  );
}

export default Channels;
