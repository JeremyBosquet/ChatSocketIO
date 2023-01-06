
import { useEffect, useState } from 'react';
import { Iuser, IuserDb } from './interfaces/users';
import SendMessage from './SendMessage/SendMessage';
import Player from './Player/Player';
import Messages from './Messages/Messages';
import { Imessage } from './interfaces/messages';
import { useDispatch, useSelector } from 'react-redux';
import { getChannels, getSocket, setChannels } from '../../../Redux/chatSlice';
import { getUser, setUser } from '../../../Redux/userSlice';
import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { MdPublic } from 'react-icons/md';
import { IoMdLock } from 'react-icons/io';
import { BsFillEyeSlashFill, BsFillShieldLockFill } from 'react-icons/bs';
import './ChatChannel.scss'
import instance from '../../../API/Instance';
import { Helmet } from "react-helmet";
import { IoEyeSharp } from 'react-icons/io5';

interface Ichannel {
	id: string;
	name: string;
	users: IuserDb[];
	visibility: string;
	code: string;
}
interface IInvites {
	requestFrom: string;
	roomId: string;
}
interface props {
	invites: IInvites[];
}
function ChatChannel(props: props) {
	const [messages, setMessages] = useState<Imessage[]>([]);
	const [users, setUsers] = useState<IuserDb[]>([]);
	const [usersConnected, setUsersConnected] = useState<Iuser[]>([]);
	const [channel, setChannel] = useState<Ichannel>();
	const [mutedUsers, setMutedUsers] = useState<any[]>([]);
	const [showCode, setShowCode] = useState<boolean>(false);
	const channels = useSelector(getChannels);
	const params = useParams();

	const selectedChannel = params.id || "";
	const user = useSelector(getUser);
	const socket = useSelector(getSocket);

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const getUsersChannel = async () => {
		await instance.get("chat/channels/user")
			.then((res) => {
				if (res)
					dispatch(setChannels(res.data));
			})
	}

	const getMessages = async () => {
		await instance.get("chat/messages/" + selectedChannel)
			.then(res => {
				if (res.data)
					setMessages(res.data);
			}).catch(err => {
				if (err.response.status === 401) {
					getUsersChannel();
					setMessages([]);
				}
				navigate('/chat/channel');
			});
	}

	useEffect(() => {
		if (params.id !== undefined) {
			const getChannel = async () => {
				const channel = (await instance.get("chat/channel/" + selectedChannel)).data;
				if (channel) {
					setChannel(channel);
					setUsers(channel.users);
					dispatch(setUser({ ...user, role: channel.users.find((u: IuserDb) => u.uuid === user.uuid)?.role }));
				}
			}
			if (selectedChannel !== undefined) {
				socket?.emit("join", { channelId: selectedChannel, userId: user.uuid });
				getMessages();
			}

			getChannel();

		} else
		navigate("/chat/channel/");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params.id])
	
	useEffect(() => {
		if (params.id !== undefined && channel?.users) {
			const getMutedUsers = async () => {
				await instance.get("chat/mutes/" + selectedChannel)
					.then(res => {
						if (res.data)
							setMutedUsers(res.data);
					});
			}

			// check if user is admin or owner
			if (selectedChannel && (channel?.users.filter(u => u.uuid === user.uuid)[0]?.role === "admin" || channel?.users.filter(u => u.uuid === user.uuid)[0]?.role === "owner")) {
				getMutedUsers();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [channel])
	
	useEffect(() => {
		if (selectedChannel) {
			const thisChannel = channels.filter((c: Ichannel) => c.id === selectedChannel)[0];
			
			if (thisChannel && thisChannel.visibility !== channel?.visibility) {
				setChannel(thisChannel);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [channels])

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

			socket.removeListener('updateAllPlayers');
			socket?.on('updateAllPlayers', (usersDb: IuserDb[]) => {
				setUsers(usersDb);
			});

			socket.removeListener('updateMutes');
			socket?.on('updateMutes', (usersDb: []) => {
				setMutedUsers(usersDb);
			});

			socket.removeListener('kickFromChannel');
			socket.on('kickFromChannel', (data: { target: string, channelId: string, message: string }) => {
				socket?.emit('leavePermanant', { userId: user.uuid, channelId: data.channelId });
				getUsersChannel();
				if (params.id === data.channelId)
					navigate('/chat/channel');
			});

			socket.removeListener('adminFromServer');
			socket.on('adminFromServer', (data: { target: string, channelId: string, message: string, role: string }) => {
				if (data.target === user.uuid) {
					dispatch(setUser(({ ...user, role: data.role })));
				}
				if (params.id === data.channelId) {
					if (user?.role === "admin") {
						setUsers(users => users.map((user: IuserDb) => {
							if (user.uuid === data.target)
								return ({ ...user, role: data.role });

							return user;
						}));
					}
				}
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket])

	return (
		<>
			<div className='ChatChannel'>
				{
					!channel?.name ? <h2>Select a channel</h2> :
						<>
							<Helmet>
								<meta charSet="utf-8" />
								<title> {channel.name} - transcendence </title>
								<link rel="icon" type="image/png" href="/logo.png" />
							</Helmet>
							<div className='ChatChannelInfos'>
								<p>{channel.name}</p>
								{channel.visibility === "public" ?
									(<MdPublic className='channelIcon' />)
									: channel.visibility === "private" ?
										(
											<div className='privateInfos'>
												{
													showCode ?
														<p className="code">{channel.code}</p>
														: null
												}
												{!showCode ? <IoEyeSharp className="showCode" onClick={() => setShowCode(true)} /> : <BsFillEyeSlashFill className="showCode" onClick={() => setShowCode(false)} />}
												<IoMdLock className='channelIcon' />
											</div>
										)
										: channel.visibility === "protected" ?
											(<BsFillShieldLockFill className='channelIcon' />)
											:
											(channel.visibility)}
							</div>
							<Messages userId={user.uuid} messages={messages} users={users} setUsers={setUsers} setMessages={setMessages} />
							<div className='sendMessage'>
								<SendMessage channelId={selectedChannel} user={user} />
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
							<Player key={user.uuid} setUsers={setUsers} users={users} user={user} usersConnected={usersConnected} mutedUsers={mutedUsers} invites={props.invites} />
							: null
					))}
				</div>
			</div>
		</>
	);
}

export default ChatChannel;
