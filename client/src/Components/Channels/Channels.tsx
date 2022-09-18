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

interface props {
    socket: Socket | undefined;
    user: {id: string};
    // setSelectedChannel: any;
    // selectedChannel: string;
}

function Channels(props: props) {
    const UserId = props.user.id;
    const [searchChannel, setSearchChannel] = useState<string>("");
    const [init, setInit] = useState<boolean>(false);
    const [channels, setChannels] = useState<[]>([]);
    const [channelsFind, setChannelsFind] = useState<[]>([]);

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
            getUsersChannel(UserId);
        //eslint-disable-next-line
    }, [init])

    return (
    <div className='channels'>
        <div className='channelsOperations'>
            <FormCreateChannel socket={props.socket} user={props.user} setChannels={setChannels}/>
            <Search socket={props.socket} user={{id: props.user.id}} setChannels={setChannels} searchChannel={searchChannel} setSearchChannel={setSearchChannel} setChannelsFind={setChannelsFind}/>
        </div>
        <div className='channelInfos'>
            {searchChannel === "" ? 
                <div className='channelInfo'>
                    <h2>Your channels</h2>
                    {channels.map((channel) => (
                        <Channel key={channel["id"]} socket={props.socket} user={{id: props.user.id}} channel={channel} setChannels={setChannels} setSearchChannel={setSearchChannel} foundChannel={false}/>
                        // <Channel key={channel["id"]} socket={props.socket} user={{id: props.user.id}} channel={channel} setChannels={setChannels} setSearchChannel={setSearchChannel} setSelectedChannel={props.setSelectedChannel} selectedChannel={props.selectedChannel} foundChannel={false}/>
                    ))}
                </div>
                :
                <div className='channelInfo'>
                    <h2>Channel(s) found</h2>
                    {channelsFind.map((channel) => (
                        // <Channel key={channel["id"]} socket={props.socket} user={{id: props.user.id}} channel={channel} setChannels={setChannels} setSearchChannel={setSearchChannel} setSelectedChannel={props.setSelectedChannel} selectedChannel={props.selectedChannel} foundChannel={true}/>
                        <Channel key={channel["id"]} socket={props.socket} user={{id: props.user.id}} channel={channel} setChannels={setChannels} setSearchChannel={setSearchChannel} foundChannel={true}/>
                    ))}
                </div>
                // <div className='channelInfo'>
                //     <h2>Your channels</h2>
                //     {channels.map((channel) => (
                //         <Channel key={channel["id"]} socket={props.socket} user={{id: props.user.id}} channel={channel} setChannels={setChannels} setSearchChannel={setSearchChannel} setSelectedChannel={props.setSelectedChannel} selectedChannel={props.selectedChannel} foundChannel={false}/>
                //     ))}
                // </div>
                // :
                // <div className='channelInfo'>
                //     <h2>Channel(s) found</h2>
                //     {channelsFind.map((channel) => (
                //         <Channel key={channel["id"]} socket={props.socket} user={{id: props.user.id}} channel={channel} setChannels={setChannels} setSearchChannel={setSearchChannel} setSelectedChannel={props.setSelectedChannel} selectedChannel={props.selectedChannel} foundChannel={true}/>
                //     ))}
                // </div>
            }
            <div className='channelChat'>
                {/* { props.selectedChannel !== "" ? 
                    <ChatChannel socket={props.socket} user={{id: props.user.id}} selectedChannel={props.selectedChannel} />
                        :
                    <p>Select a channel</p>
                } */}
                { selectedChannel !== "" ? 
                    <ChatChannel socket={props.socket} user={{id: props.user.id}} selectedChannel={selectedChannel} />
                        :
                    <p>Select a channel</p>
                }
            </div>
        </div>
    </div>
  );
}

export default Channels;
