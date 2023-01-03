import React from 'react';
import { useEffect, useState } from 'react';
import ChatChannel from './ChatChannel/ChatChannel';
import { useDispatch, useSelector } from 'react-redux';
import { setChannels } from '../../Redux/chatSlice';
import { useParams } from 'react-router-dom';
import { getUser } from '../../Redux/userSlice';
import './Channels.scss';
import instance from '../../API/Instance';
interface IInvites {
	requestFrom: string;
	roomId: string;
}
interface props {
	invites: IInvites[];
	searchChannel: string;
	setSearchChannel: any;
	setChannelsFind: any;
}


function Channels(props: props) {
	const params = useParams();
	const [init, setInit] = useState<boolean>(false);
	const dispatch = useDispatch();

	const user = useSelector(getUser);

	const getUsersChannel = async () => {
		await instance.get("chat/channels/user")
			.then((res) => {
				if (res)
					dispatch(setChannels(res.data));
				setInit(true);
			})
	}

	useEffect(() => {

		if (!init && user.uuid)
			getUsersChannel();
		//eslint-disable-next-line
	}, [init, user])

	return (
		<>
			<div className='channels'>
				<div className='channelChat'>
					{params.id !== undefined ?
						<ChatChannel invites={props.invites} /> : null
					}
				</div>
			</div>
		</>
	);
}

export default Channels;
