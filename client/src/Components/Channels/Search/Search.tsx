import axios from 'axios';import { getUser } from '../../../Redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket, setChannels } from '../../../Redux/chatSlice';
import { useState } from 'react';
import React from 'react';

interface props {
    searchChannel: string;
    setSearchChannel: any;
    setChannelsFind: any;
    getUsersChannel: any;
}

function Search(props: props) {
    const [privateJoin, setPrivateJoin] = useState<boolean>(false);
    const user = useSelector(getUser);
    const socket = useSelector(getSocket);

    const dispatch = useDispatch();

    const handleSearch = async (e: any) => {
        props.setSearchChannel(e.target.value);

        const getUsersChannel = async (e: any) => {
            await axios.get("http://90.66.192.148:7000/api/chat/channels/user/" + user.uuid)
            .then((res) => {
                if (res)
                    dispatch(setChannels(res.data));
            })
        }

        if (e.target.value === "")
            getUsersChannel(user.uuid)
        else {
            await axios.get("http://90.66.192.148:7000/api/chat/channels/byname/" + e.target.value + "/" + user.uuid)
            .then((res) => {
                if (res)
                    props.setChannelsFind(res.data);
            })
        }
    }

    const handleJoinPrivate = async (e: any) => {
        e.preventDefault();
        const data = {
            code: e.target.joinPrivate.value,
            userId: user.uuid
        }
        await axios.post("http://90.66.192.148:7000/api/chat/channel/join/code", data)
        .then((res) => {
            if (res)
            {
                setPrivateJoin(false);
                props.getUsersChannel(user.uuid);
                socket?.emit('joinPermanent', { channelId: res.data.channelId });
                console.log('la join emit')
            }
        }).catch((err) => {
            console.log(err.response.data.message); //set in notification
        })
    }
    
  return (
    <>
        <input type="text" value={props.searchChannel} onChange={e => handleSearch(e)}/>
        <div className='channelsPrivateJoin'>
                <button onClick={() => setPrivateJoin(!privateJoin)}>Join private</button>
                {
                    privateJoin ? 
                        <form onSubmit={handleJoinPrivate}>
                            <input name="joinPrivate" placeholder='Private code'></input>
                            <button type="submit">Join</button>
                        </form>
                    :
                    null                
                }
            </div>
    </>
  );
}

export default Search;
