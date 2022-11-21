import axios from 'axios';
import React from 'react';
import { useEffect, useState } from 'react';
import FormCreateChannel from '../FormCreateChannel/FormCreateChannel';
import Channel from './Channel/Channel';
import Search from './Search/Search';
import './Channels.scss';
import ChatChannel from './ChatChannel/ChatChannel';
import { useDispatch, useSelector } from 'react-redux';
import { getChannels, setChannels } from '../../Redux/chatSlice';
import { useParams } from 'react-router-dom';
import { getUser } from '../../Redux/authSlice';
interface IInvites {
    requestFrom: string;
    roomId: string;
  }
interface props {
    invites: IInvites[];
}


function Channels(props: props) {
    const params = useParams();
    const [searchChannel, setSearchChannel] = useState<string>("");
    const [init, setInit] = useState<boolean>(false);
    const [channelsFind, setChannelsFind] = useState<[]>([]);
    const dispatch = useDispatch();

    const user = useSelector(getUser);
    const channels = useSelector(getChannels);
    
    const getUsersChannel = async (userId: any) => {
        await axios.get("http://90.66.192.148:7000/api/chat/channels/user/" + userId)
        .then((res) => {
            if (res)
                dispatch(setChannels(res.data));
                setInit(true);
        })
    }

    useEffect(() => {
        
        if (!init && user.uuid)
            getUsersChannel(user.uuid);
        //eslint-disable-next-line
    }, [init, user])

    return (
    <div className='channels'>
        <div className='channelsOperations'>
            <FormCreateChannel/>
            <Search searchChannel={searchChannel} setSearchChannel={setSearchChannel} setChannelsFind={setChannelsFind} getUsersChannel={getUsersChannel}/>
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
                { params.id !== undefined ? 
                    <ChatChannel invites={props.invites} />
                        :
                    <p>Select a channel</p>
                }
            </div>
        </div>
    </div>
  );
}

export default Channels;
