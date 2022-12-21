import axios from 'axios';import { getUser } from '../../../Redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket, setChannels } from '../../../Redux/chatSlice';
import { useState } from 'react';
import React from 'react';
import { createNotification } from '../../notif/Notif';
import './Search.scss'
import instance from '../../../API/Instance';
interface props {
    searchChannel: string;
    setSearchChannel: any;
    setChannelsFind: any;
    getUsersChannel: any;
}

function Search(props: props) {
    const user = useSelector(getUser);
    const socket = useSelector(getSocket);

    const dispatch = useDispatch();

    const handleSearch = async (e: any) => {
        props.setSearchChannel(e.target.value);

        const getUsersChannel = async (e: any) => {
            await instance.get("chat/channels/user/" + user.uuid)
            .then((res) => {
                if (res)
                    dispatch(setChannels(res.data));
            })
        }

        if (e.target.value === "")
            getUsersChannel(user.uuid)
        else {
            await instance.get("chat/channels/byname/" + e.target.value + "/" + user.uuid)
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
        await instance.post("chat/channel/join/code", data)
        .then((res) => {
            if (res)
            {
                props.getUsersChannel(user.uuid);
                socket?.emit('joinPermanent', { channelId: res.data.channelId });
                createNotification("success", "You have successfully join the private channel.");
            }
        }).catch((err) => {
            createNotification("error", err.response.data.message);
        })
    }
    
  return (
    <>
        <form onSubmit={handleJoinPrivate} className="searchChannel">
            <input name="joinPrivate" className="searchInput" type="text" value={props.searchChannel} onChange={e => handleSearch(e)} placeholder="Channel's name/private code"/>
            <button className="searchButton" type="submit">Join private</button>
        </form>
    </>
  );
}

export default Search;
