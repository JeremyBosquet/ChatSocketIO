import axios from 'axios';
import { useEffect, useState } from 'react';
import FormCreateChannel from '../FormCreateChannel/FormCreateChannel';
import Channel from './Channel/Channel';
import Search from './Search/Search';
import './Channels.scss';
import ChatChannel from './ChatChannel/ChatChannel';
import { useDispatch, useSelector } from 'react-redux';
import { getChannels, getSelectedChannel, setChannels } from '../../Redux/chatSlice';
import { getUser } from '../../Redux/authSlice';

function Channels() {
    const [searchChannel, setSearchChannel] = useState<string>("");
    const [init, setInit] = useState<boolean>(false);
    const [channelsFind, setChannelsFind] = useState<[]>([]);
    const dispatch = useDispatch();

    const user = useSelector(getUser);
    const channels = useSelector(getChannels);
    const selectedChannel = useSelector(getSelectedChannel);
    
    useEffect(() => {
        const getUsersChannel = async (userId: any) => {
            await axios.get("http://localhost:4000/api/chat/channels/user/" + userId)
            .then((res) => {
                if (res)
                    dispatch(setChannels(res.data));
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
            <FormCreateChannel/>
            <Search searchChannel={searchChannel} setSearchChannel={setSearchChannel} setChannelsFind={setChannelsFind}/>
        </div>
        <div className='channelInfos'>
            {searchChannel === "" ? 
                <div className='channelInfo'>
                    <h2>Your channels</h2>
                    {channels.map((channel : any) => (
                        <Channel key={channel["id"]} channel={channel} setSearchChannel={setSearchChannel} foundChannel={false}/>
                    ))}
                </div>
                :
                <div className='channelInfo'>
                    <h2>Channel(s) found</h2>
                    {channelsFind.map((channel) => (
                        <Channel key={channel["id"]} channel={channel} setSearchChannel={setSearchChannel} foundChannel={true}/>
                    ))}
                </div>
            }
            <div className='channelChat'>
                { selectedChannel !== "" ? 
                    <ChatChannel />
                        :
                    <p>Select a channel</p>
                }
            </div>
        </div>
    </div>
  );
}

export default Channels;