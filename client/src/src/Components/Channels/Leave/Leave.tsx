
import { useSelector, useDispatch } from 'react-redux';
import { getSocket, setChannels } from '../../../Redux/chatSlice';
import { getUser } from '../../../Redux/userSlice';
import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { createNotification } from '../../notif/Notif';
import instance from '../../../API/Instance';

interface props {
	channelId: string;
	setSearchChannel: any;
}

function Leave(props: props) {
	const user = useSelector(getUser);
	const socket = useSelector(getSocket);
	const dispatch = useDispatch()

	const params = useParams();
	const navigate = useNavigate();

	const handleLeave = async (e: any, id: string) => {
		e.cancelBubble = true;
		e.stopPropagation();

		const getUsersChannel = async () => {
			await instance.get("chat/channels/user")
				.then((res) => {
					if (res)
						dispatch(setChannels(res.data));
				})
		}

		await instance.post("chat/channel/leave", { "channelId": id })
			.then(() => {
				getUsersChannel();
				socket?.emit('leavePermanant', { userId: user.uuid, channelId: id });
				props.setSearchChannel("");
				createNotification('success', 'You have successfully left the channel.');
				if (params.id === id)
					navigate('/chat/channel');
			})
	}

	return (
		<>
			<button className='channelMenuButton' onClick={e => handleLeave(e, props.channelId)}>Leave</button>
		</>
	);
}

export default Leave;
