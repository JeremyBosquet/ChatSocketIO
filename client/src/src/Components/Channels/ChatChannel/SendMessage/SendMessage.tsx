import { useState } from "react";
import { useSelector } from "react-redux";
import { getSocket } from "../../../../Redux/chatSlice";
import React from 'react';
import './SendMessage.scss'

interface props {
	channelId: string;
	user: { uuid: string };
}

function SendMessage(props: props) {
	const [message, setMessage] = useState<string>("");
	const socket = useSelector(getSocket);

	const handleSubmit = (e: any) => {
		e.preventDefault();
		if (message === "")
			return;
		socket?.emit('message', { userId: props.user.uuid, message: message, channelId: props.channelId, type: "message" });
		setMessage("");
	}

	return (
		<form className="sendForm" onSubmit={handleSubmit}>
			<input className="sendInput" type="text" placeholder="Enter message" value={message} onChange={(e) => setMessage(e.target.value)}></input>
			<button className="sendButton" type="submit">Send</button>
		</form>
	);
}

export default SendMessage;
