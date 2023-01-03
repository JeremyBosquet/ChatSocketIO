import { useSelector } from 'react-redux';
import '@szhsin/react-menu/dist/core.css';
import { getSocket } from '../../../Redux/chatSlice';
import { getUser } from '../../../Redux/userSlice';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { IoMdLock } from 'react-icons/io';
import instance from '../../../API/Instance';

interface props {
	dm: any;
}

function DM(props: props) {
	const user = useSelector(getUser);
	const socket = useSelector(getSocket);
	const [name, setName] = useState<string>("Pending...");

	const params = useParams();
	const selectedChannelDM = params.id || "";
	const navigate = useNavigate();


	const handleSelectChannel = (id: string) => {
		if (selectedChannelDM !== "" && selectedChannelDM !== id) {
			socket?.emit('leave', { userId: user.uuid, channelId: selectedChannelDM });
		}
		navigate('/chat/dm/' + id);
	}

	useEffect(() => {
		const getName = async () => {
			const userId = props.dm.users[0]?.id === user.uuid ? props.dm.users[1]?.id : props.dm.users[0]?.id;
			const u = (await instance.get("chat/user/" + userId)).data;
			if (u?.username)
				setName(u.username);
		}
		getName();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<div key={props.dm["id"]} onClick={e => handleSelectChannel(props.dm["id"])} className="channel">
				<div className="channelInfoName">
					<p>{name}</p>
					<p><IoMdLock className='channelIcon' /></p>
				</div>
			</div>
		</>
	);
}

export default DM;
