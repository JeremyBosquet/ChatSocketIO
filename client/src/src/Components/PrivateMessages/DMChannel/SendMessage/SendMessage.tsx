import { useState } from "react";
import { useSelector } from "react-redux";
import { getSocket } from "../../../../Redux/chatSlice";
import React from 'react';
import { createNotification } from "../../../notif/Notif";

interface props {
	channelId: string;
	user: { uuid: string };
	blocked: boolean;
}

function SendMessage(props: props) {
	const [message, setMessage] = useState<string>("");
	const socket = useSelector(getSocket);

	const handleSubmit = (e: any) => {
		e.preventDefault();
		if (message === "")
			return;

		if (message.length > 2000) {
			setMessage("");
			createNotification("error", "Message too long (max 2000 characters)")
			return;
		}
		
		if (props.blocked)
			createNotification("error", "You are blocked or you have blocked this player.");

		socket?.emit('message', { userId: props.user.uuid, message: message, channelId: props.channelId, type: "dm" });
		setMessage("");
	}

	return (
		<form className="sendForm" onSubmit={handleSubmit}>
			{
				!props.blocked ?
					<input className="sendInput" type="text" placeholder="Enter message" value={message} onChange={(e) => setMessage(e.target.value)}></input>
					:
					<input className="sendInput" type="text" placeholder="You are blocked or you have blocked this player." value={message} disabled></input>
			}
			<button className="sendButton" type="submit">Send</button>
		</form>
	);
}

export default SendMessage;
