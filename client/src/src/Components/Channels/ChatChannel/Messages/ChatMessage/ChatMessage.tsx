import { Imessage } from "../../interfaces/messages";
import { IuserDb } from "../../interfaces/users";
import React, { useEffect, useState } from 'react';
import './ChatMessage.scss';
import { AiOutlineConsoleSql } from "react-icons/ai";

interface props {
	userId: string;
	users: IuserDb[];
	message: Imessage;
	setUsers: any;
	blockedByList: any;
	blockList: any;
}

function ChatMessage(props : props) {
	const user = props.users.filter(user => user.uuid === props.message.userId)[0]?.username;
	const [blockPrint, setBlockPrint] = useState(false);
	
	useEffect(() => {
		if (props.blockList.filter((user: any) => user.uuid === props.message.userId).length > 0 || props.blockedByList.filter((user: any) => user.uuid === props.message.userId).length > 0)
			setBlockPrint(true);
		else
			setBlockPrint(false);
	}, [props.blockList, props.blockedByList]);

  return (
	<>
		{
			blockPrint ?
				<></>
			:
				<>
					<div className={props.message.userId === props.userId ? "message sender" : "message"}>
						<p className="messageContent">{props.message.message}</p>
					</div>
					<p className={props.message.userId === props.userId ? "messageUser right" : "messageUser left"}>{user}</p>
				</>
		}
	</>
  );
}

export default ChatMessage;