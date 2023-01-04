
import { useState } from "react";
import { useSelector } from "react-redux";
import { getUser } from "../../../../../Redux/userSlice";
import { getSocket } from "../../../../../Redux/chatSlice";
import { IuserDb } from "../../interfaces/users";
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import './JoinProtected.scss'
import { useNavigate, useParams } from "react-router-dom";
import React from 'react';
import { createNotification } from "../../../../notif/Notif";
import DatePicker from "../DatePicker/DatePicker";
import instance from "../../../../../API/Instance";

interface props {
	channelId: string;
	handleJoin: any;
	password: string;
	setPassword: any;
	joinMenu: boolean;
	setJoinMenu: any;
}

function JoinProtected(props: props) {

	const handleClose = () => {
		props.setJoinMenu(false);
	}

	const handleOpen = () => {
		props.setJoinMenu(true);
	}

	return (
		<>
			{props.joinMenu ?
				<div className="joinMenu">
					<div className="joinContainer">
						<div className="joinInfos">
							<h3>Join</h3>
							<span onClick={() => handleClose()}>X</span>
						</div>
						<div className="joinDuration" onSubmit={(e) => props.handleJoin(e, props.channelId)}>
							<form className="joinForm">
								<input className="joinInput" placeholder="Password" value={props.password} onChange={e => props.setPassword(e.target.value)}></input>
								<button className="joinButton" type="submit">Join</button>
							</form>
						</div>
					</div>
				</div>
				: null
			}
				<button className='joinChannelButton' onClick={e => handleOpen()}>Join</button>
		</>
	);
}

export default JoinProtected;