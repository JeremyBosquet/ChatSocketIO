import { useEffect, useRef, useState } from "react";
import ChatMessage from "../../../Channels/ChatChannel/Messages/ChatMessage/ChatMessage";
import { Imessage } from "../interfaces/messages";
import { IuserDb } from "../interfaces/users";
import './Messages.scss';
import React from 'react';
import { useSelector } from "react-redux";
import { getBlockedByList, getBlockList } from "../../../../Redux/userSlice";

import instance from "../../../../API/Instance";
interface props {
	userId: string;
	messages: Imessage[];
	users: IuserDb[];
	setUsers: any;
	setMessages: any;
}

function Messages(props: props) {
	const messageEl = useRef<HTMLDivElement>(null);
	const [usersChannel, setUsersChannel] = useState<IuserDb[]>(props.users);
	const blockedByList = useSelector(getBlockedByList);
	const blockList = useSelector(getBlockList);

	useEffect(() => {
		const getUsername = async () => {
			let temp = usersChannel;
			for (let i = 0; i < props.messages.length; i++) {
				const userFinded = temp.find(user => user.uuid === props.messages[i].userId); ``
				if (!userFinded) {
					await instance.get(`chat/user/` + props.messages[i].userId).then(res => {
						if (res.data)
							temp = [...temp, { ...res.data, print: false }];
					});
				}
			}
			setUsersChannel(temp);
		}

		setTimeout(() => {
			if (messageEl.current)
				messageEl.current.scroll({ top: messageEl.current.scrollHeight, behavior: 'auto' });
		}, 1)

		getUsername();
	}, [props.messages]);

	return (
		<div id="messages" className='messages' ref={messageEl}>
			{props.messages.map((message: Imessage, index) => (
				<ChatMessage key={index} message={message} users={usersChannel} userId={props.userId} setUsers={setUsersChannel} blockedByList={blockedByList} blockList={blockList} />
			))}
		</div>
	);
}

export default Messages;