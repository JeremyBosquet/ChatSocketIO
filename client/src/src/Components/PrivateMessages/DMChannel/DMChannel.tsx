
import { useEffect, useState } from 'react';
import { Iuser, IuserDb } from './interfaces/users';
import SendMessage from './SendMessage/SendMessage';
import Player from './Player/Player';
import Messages from './Messages/Messages';
import { Imessage } from './interfaces/messages';
import './DMChannel.scss'
import { useDispatch, useSelector } from 'react-redux';
import { getSocket, setChannels } from '../../../Redux/chatSlice';
import { getBlockedByList, getBlockList, getUser } from '../../../Redux/userSlice';
import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { IoMdLock } from 'react-icons/io';
import instance from '../../../API/Instance';
import { Helmet } from "react-helmet";

interface IInvites {
	requestFrom: string;
	roomId: string;
}
interface props {
	invites: IInvites[];
}

function DMChannel(props: props) {
	const [messages, setMessages] = useState<Imessage[]>([]);
	const [users, setUsers] = useState<IuserDb[]>([]);
	const [usersConnected, setUsersConnected] = useState<Iuser[]>([]);
	const [dm, setDm] = useState<any>();
	const [name, setName] = useState<string>();
	const params = useParams();

	const blockList = useSelector(getBlockList);
	const blockedByList = useSelector(getBlockedByList);
	const [blocked, setBlocked] = useState<boolean>(false);
	const [blockedBy, setBlockedBy] = useState<boolean>(false);

	const socket = useSelector(getSocket);
	const selectedChannelDM = params.id || "";
	const user = useSelector(getUser);
	const navigate = useNavigate();

	const dispatch = useDispatch();

	async function isBlocked(userId: string) {
		let userFinded = blockList.find((blockedUser: any) => blockedUser.uuid === userId);
		if (userFinded) {
			setBlocked(true);
			return (true);
		}
		setBlocked(false);
		return (false);
	}

	async function isBlockedBy(userId: string) {
		let userFinded = blockedByList.find((blocked: any) => blocked.uuid === userId);
		if (userFinded) {
			setBlockedBy(true);
			return (true);
		}
		setBlockedBy(false);
		return (false);
	}

	useEffect(() => {
		const userId = dm?.users[0]?.uuid === user.uuid ? dm?.users[1]?.uuid : dm?.users[0]?.uuid;

		isBlocked(userId);
	}, [blockList])

	useEffect(() => {
		const userId = dm?.users[0]?.uuid === user.uuid ? dm?.users[1]?.uuid : dm?.users[0]?.uuid;

		isBlockedBy(userId);
	}, [blockedByList])

	useEffect(() => {
		const userId = dm?.users[0]?.uuid === user.uuid ? dm?.users[1]?.uuid : dm?.users[0]?.uuid;

		isBlocked(userId);
		isBlockedBy(userId);
		//eslint-disable-next-line
	}, [dm])

	const getUsersChannel = async () => {
		await instance.get("chat/dms/user")
			.then((res) => {
				if (res)
					dispatch(setChannels(res.data));
			})
	}

	const getMessages = async () => {
		await instance.get("chat/dm/messages/" + selectedChannelDM)
			.then(res => {
				if (res.data)
					setMessages(res.data);
			}).catch(() => {
				getUsersChannel();
				setMessages([]);
				navigate('/chat/dm');
			});
	}

	useEffect(() => {
		const getChannel = async () => {
			const dm = (await instance.get("chat/dm/" + selectedChannelDM)).data;
			setDm(dm);
			setUsers(dm.users);
		}
		if (params.id) {
			socket?.emit("join", { channelId: params.id, userId: user.uuid });
			getMessages();
		}

		getChannel();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params.id])

	useEffect(() => {
		const getName = async () => {
			const userId = dm?.users[0]?.uuid === user.uuid ? dm?.users[1]?.uuid : dm?.users[0]?.uuid;
			const u = (await instance.get(`chat/user/` + userId)).data;
			if (u?.username)
				setName(u.username);
		}
		if (dm?.id)
			getName();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dm])

	useEffect(() => {
		if (socket) {
			socket.removeListener('messageFromServer');
			socket.on('messageFromServer', (message: Imessage) => {
				setMessages(messages => [...messages, message]);
			});

			socket.removeListener('usersConnected');
			socket.on('usersConnected', (usersConnected: Iuser[]) => {
				setUsersConnected(usersConnected);
			});
		}
	}, [socket])


	return (
		<>
			<div className='ChatChannel'>
				{
					!name ? <h2>Select a channel</h2> :
						<>
							<div className='ChatChannelInfos'>
								<Helmet>
									<meta charSet="utf-8" />
									<title>{name} - transcendence </title>
									<link rel="icon" type="image/png" href="/logo.png" />
								</Helmet>
								<p>{name}</p>
								<IoMdLock className='channelIcon' />
							</div>
							<Messages userId={user.uuid} messages={messages} users={users} setUsers={setUsers} setMessages={setMessages} />
							<div className='sendMessage'>
								{
									!blocked && !blockedBy ?
										<SendMessage channelId={selectedChannelDM} user={user} blocked={false} />
										:
										<SendMessage channelId={selectedChannelDM} user={user} blocked={true} />
								}
							</div>
						</>
				}
			</div>
			<div className='playersList'>
				<div className='playersTitle'>
					<p>Players</p>
				</div>
				<div className='players'>
					{users?.map((user: any) => (
						user.print === undefined && user.print !== false ?
							<Player key={user.uuid} setUsers={setUsers} users={users} user={user} usersConnected={usersConnected} invites={props.invites} />
							: null
					))}
				</div>
			</div>
		</>
	);
}

export default DMChannel;
