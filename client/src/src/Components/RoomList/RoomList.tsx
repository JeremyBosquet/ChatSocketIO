import { Socket } from "socket.io-client";

import React from "react";
import instance from "../../API/Instance";

interface props {
	socket: Socket | undefined;
	name: string;
	room: string;
	setName: any;
	setRoom: any;
	setJoined: any;
	setMessages: any;
}

function FormChat(props: props) {
	const handleSubmit = async (e: any) => {
		e.preventDefault();

		if (props.name === "" || props.room === "") {
			alert("Please enter a name and room");
			return;
		}

		props.socket?.emit(
			"join",
			{ name: props.name, room: props.room },
			(error: any) => {
				if (error) {
					alert(error);
					return;
				}
			}
		);

		props.setJoined(true);
		const messages = await instance.get(
			`chat/messages/` + props.room
		);

		if (messages?.data) {
			props.setMessages(messages.data);
		}
	};

	return (
		<div>
			<form className="ChatJoinForm" onSubmit={handleSubmit}>
				<input
					className="ChatJoinInput"
					id="name"
					type="text"
					value={props.name}
					onChange={(e) => props.setName(e.target.value)}
					placeholder="Name"
				></input>
				<input
					className="ChatJoinInput"
					type="text"
					value={props.room}
					onChange={(e) => props.setRoom(e.target.value)}
					placeholder="Room"
				></input>
				<button className="ChatJoinButton" type="submit">
					Join chat
				</button>
			</form>
		</div>
	);
}

export default FormChat;
