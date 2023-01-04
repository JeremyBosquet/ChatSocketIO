import { ControlledMenu } from "@szhsin/react-menu";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getBlockedByList, getBlockList, getUser } from "../../../../Redux/userSlice";
import { Iuser, IuserDb } from "../interfaces/users";
import React from 'react';
import { Link } from "react-router-dom";
import Block from "./Block/Block";
import AddRemoveFriend from "./AddRemoveFriend/AddRemoveFriend";
import InviteGame from "./InviteGame/InviteGame";
import { getSockeGameChat } from "../../../../Redux/gameSlice";
import { TbDotsVertical } from "react-icons/tb";

interface IInvites {
	requestFrom: string;
	roomId: string;
}

interface props {
	users: IuserDb[];
	setUsers: any;
	user: IuserDb;
	usersConnected: Iuser[];
	invites: IInvites[];
}

function Player(props: props) {
	const [mobileMode, setMobileMode] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [connected, setConnected] = useState<boolean>(false);
	const me = useSelector(getUser);
	const socketGame = useSelector(getSockeGameChat);
	const blockList = useSelector(getBlockList);
	const blockedByList = useSelector(getBlockedByList);
	const [blocked, setBlocked] = useState<boolean>(false);
	const [blockedBy, setBlockedBy] = useState<boolean>(false);
	const topAnchor = useRef(null);

	async function isBlocked(user: IuserDb) {
		let userFinded = blockList.find((blockedUser: any) => blockedUser.uuid === user.uuid);
		if (userFinded) {
			setBlocked(true);
			return (true);
		}
		setBlocked(false);
		return (false);
	}

	async function isBlockedBy(user: IuserDb) {
		let userFinded = blockedByList.find((blocked: any) => blocked.uuid === user.uuid);
		if (userFinded) {
			setBlockedBy(true);
			return (true);
		}
		setBlockedBy(false);
		return (false);
	}

	useEffect(() => {
		async function isConnected(user: IuserDb) {
			let userFinded = props.usersConnected.find(userConnected => userConnected.userId === user.uuid);
			if (userFinded) {
				setConnected(true);
				return (true);
			}
			setConnected(false);
			return (false);
		}

		isBlocked(props.user);
		isBlockedBy(props.user);
		isConnected(props.user);
		//eslint-disable-next-line
	}, [props.usersConnected])

	useEffect(() => {
		isBlocked(props.user);
	}, [blockList])

	useEffect(() => {
		isBlockedBy(props.user);
	}, [blockedByList])

	const hasInvited = (userId: string) => {
		let invite = props.invites.find((u: any) => u.requestFrom === userId);
		if (invite)
			return (true);
		return (false);
	}

	const handleAcceptInvitation = (userId: string) => {
		let invite = props.invites.find((u: any) => u.requestFrom === userId);
		if (invite) {
			socketGame.emit('joinInviteGame', {
				roomId: invite.roomId,
				playerId: me.uuid,
				playerName: me.username
			});
		}
	}

	const usernameTrunc = (username: string) => {
		function addSpace() {
			let spaces = "";

			for (let i = 0; i <= (7 - username.length); i++)
				spaces += '\xa0';
			return (spaces);
		}

		if (me?.uuid !== props.user?.uuid && hasInvited(props.user.uuid)) {
			if (username.length >= 5)
				return (username.substring(0, 5) + '..');
			return (username + addSpace());
		}
		return (username);
	}

	function isMobile() {
		if (window.innerWidth < 1165) {
			setMobileMode(true);
			return (true);
		}
		setMobileMode(false);
		return (false);
	}

	useEffect(() => {
		isMobile()
	}, [window.innerWidth])

	return (
		<div className='player' key={props.user?.uuid}>
			<div style={{ display: "flex" }}>
				{connected && !blocked && !blockedBy ? <span className="connected"></span> : <span className="disconnected"></span>}
				<p style={{ maxWidth: "auto", overflow: "hidden", textOverflow: "ellipsis" }}>{usernameTrunc(props.user?.username)}</p>
			</div>
			<div className="playerGroupActions">
				{
					me?.uuid !== props.user?.uuid && hasInvited(props.user?.uuid) ?
						<button className='playerAcceptInvitation' onClick={() => handleAcceptInvitation(props.user?.uuid)}>Accept invitation</button>
						:
						null
				}
				{
					props.user?.uuid === me.uuid ? null :
						<>
							<span ref={topAnchor}>
								<TbDotsVertical 
									onPointerEnter={ !mobileMode ? () => setIsOpen(true) : () => {}}
									onClick={ mobileMode ? () => setIsOpen((isOpen) => !isOpen) : () => {}}
									className="playerDots"/>
							</span>
							<ControlledMenu
								viewScroll="close"
								className="playerActions"
								onKeyDown={(e: any) => e.stopPropagation()}
								state={isOpen ? "open" : "closed"}
								position={mobileMode ? "anchor" : "auto"}
								direction={mobileMode ? "top" : "bottom"}
								onMouseLeave={() => {
									setIsOpen(false)
								}}
								onScroll={() => setIsOpen(false)}
								anchorRef={topAnchor}
							>
								{connected && !blocked && !blockedBy && !hasInvited(props.user?.uuid) ? <InviteGame user={props.user} /> : null}
								<Link to={"/profile/" + props.user.trueUsername} className="actionButton">Profile</Link>
								<Block user={props.user} />
								<AddRemoveFriend user={props.user} />
							</ControlledMenu>
						</>
				}
			</div>
		</div>
	);
}

export default Player;