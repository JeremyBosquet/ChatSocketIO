import Join from '../Join/Join';
import { useSelector } from 'react-redux';
import '@szhsin/react-menu/dist/core.css';
import { getSocket } from '../../../Redux/chatSlice';
import { getUser } from '../../../Redux/userSlice';
import { useState } from 'react';
import Manage from '../Manage/Manage';
import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import './Channel.scss';
import { MdPublic } from 'react-icons/md';
import { IoMdLock } from 'react-icons/io';
import { BsFillShieldLockFill } from 'react-icons/bs';
import DevelopButton from './DevelopButton/DevelopButton';

interface props {
	channel: any;
	setSearchChannel: any;
	foundChannel: boolean;
}

function Channel(props: props) {
  const ref = useRef(null);
  const user = useSelector(getUser);
  const socket = useSelector(getSocket);

  const params = useParams();
  const selectedChannel = params.id || "";
  const navigate = useNavigate();

  const [toggleMenu, setToggleMenu] = useState<boolean>(false);
  const [manageMode, setManageMode] = useState<boolean>(false);

  const formatedDate = (d: any) => {
	const newDate = new Date(d);
	return (newDate.toLocaleDateString());
  }
  
  const handleSelectChannel = (id: string) => {
	if (!props.foundChannel && selectedChannel !== "" && selectedChannel !== id) {
	  socket?.emit('leave', { userId: user.uuid, channelId: selectedChannel });
	}
	if (!props.foundChannel && selectedChannel !== id)
	  navigate('/chat/channel/' + id);
  }

   function isOwner() {
	const userFinded = props.channel.users.find((userFind: any) => userFind.id === user.uuid);
	return (userFinded && userFinded.role === "owner");
  }

  return (
	<>
	{ manageMode ? 
		<Manage channel={props.channel} setToggleMenu={setToggleMenu} setManageMode={setManageMode}/> : null 
	}
		<div>
			<div key={props.channel["id"]} onClick={e => handleSelectChannel(props.channel["id"])} className="channel">
				<div className="channelInfoName">
					<p>{props.channel["name"]}</p>
					<p>{props.channel["visibility"] === "public" ?
						(<MdPublic className='channelIcon' />)
						: props.channel["visibility"] === "private" ?
						(<IoMdLock className='channelIcon' />)
						: props.channel["visibility"] === "protected" ?
						(<BsFillShieldLockFill className='channelIcon' />)
						: 
						(props.channel["visibility"])
					}</p>
				</div>
				<div className="channelInfoDate">
					<p>{formatedDate(props.channel["createdAt"])}</p>
					{ props.foundChannel ? 
						<Join channelId={props.channel["id"]} channelVisibility={props.channel["visibility"]} setSearchChannel={props.setSearchChannel} />
					: null }
						<DevelopButton channel={props.channel} setSearchChannel={props.setSearchChannel} foundChannel={props.foundChannel} setManageMode={setManageMode} />
				</div>

			</div>
		</div>
	</>
  );
}

export default Channel;
