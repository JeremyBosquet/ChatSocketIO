import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket, setChannels } from '../../../Redux/chatSlice';
import React from 'react';
import { createNotification } from '../../notif/Notif';
import './Join.scss';
import instance from '../../../API/Instance';
import JoinProtected from './JoinProtected/JoinProtected';

interface props {
	channelId: string;
	channelVisibility: string;
	setSearchChannel: any;
}

function Join(props: props) {
	const [joinMenu, setJoinMenu] = useState(false);
	const [password, setPassword] = useState<string>("");

	const dispatch = useDispatch();

	const socket = useSelector(getSocket);

	const handleJoin = async (e: any, id: string) => {
		e.preventDefault();
		if (props.channelVisibility === "protected")
			if (password === "")
				return;

		if (props.channelVisibility === "private") {
			createNotification("error", "You can't join this channel, please use the private code.");
			return;
		}

		const getUsersChannel = async () => {
			await instance.get("chat/channels/user")
				.then((res) => {
					if (res)
						dispatch(setChannels(res.data));
				})
		}

		await instance.post("chat/channel/join", { "channelId": id, "password": password })
			.then(() => {
				getUsersChannel();
				socket?.emit('joinPermanent', { channelId: id });
				createNotification("success", "You have successfully join the channel.");
				setJoinMenu(false);
				props.setSearchChannel("");
			}).catch((err) => {
				createNotification("error", err.response.data.message);
		})
	}

	return (
		<>
			{
				props.channelVisibility === "protected" ?
					<>
						<JoinProtected channelId={props.channelId} handleJoin={handleJoin} password={password} setPassword={setPassword} joinMenu={joinMenu} setJoinMenu={setJoinMenu}/>
						{/* <button className='joinChannelButton' onClick={e => handleJoin(props.channelId)}>Join</button> */}
					</>
					:
					<>
						<button className='joinChannelButton' onClick={e => handleJoin(e, props.channelId)}>Join</button>
					</>
			}
		</>
	);
}

export default Join;
