import { Imessage } from "../../interfaces/messages";
import { IuserDb } from "../../interfaces/users";
import React from 'react';
import './ChatMessage.scss';

interface props {
	userId: string;
	users: IuserDb[];
	message: Imessage;
	setUsers: any;
}

function ChatMessage(props : props) {
  const user = props.users.filter(user => user.uuid === props.message.userId)[0]?.username;

  return (
	<>
	  <div className={props.message.userId === props.userId ? "message sender" : "message"}>
		<p className="messageContent">{props.message.message}</p>
	  </div>
	  <p className={props.message.userId === props.userId ? "messageUser right" : "messageUser left"}>{user}</p>
	</>
  );
}

export default ChatMessage;