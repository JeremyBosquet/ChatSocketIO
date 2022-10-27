import Join from '../Join/Join';
import Leave from '../Leave/Leave';
import { ControlledMenu } from '@szhsin/react-menu';
import { useSelector, useDispatch } from 'react-redux';
import '@szhsin/react-menu/dist/core.css';
import { getSelectedChannel, getSocket, setSelectedChannel } from '../../../Redux/chatSlice';
import { getUser } from '../../../Redux/authSlice';
import { useState } from 'react';
import Manage from '../Manage/Manage';
import { useRef } from 'react';

interface props {
    channel: any;
    setSearchChannel: any;
    foundChannel: boolean;
}

function Channel(props: props) {
  const ref = useRef(null);
  const user = useSelector(getUser);
  const socket = useSelector(getSocket);
  const selectedChannel = useSelector(getSelectedChannel);
  const dispatch = useDispatch()

  const [toggleMenu, setToggleMenu] = useState<boolean>(false);
  const [manageMode, setManageMode] = useState<boolean>(false);

  const formatedDate = (d: any) => {
    const newDate = new Date(d);
    return (newDate.toLocaleDateString());
  }
  
  const handleSelectChannel = (id: string) => {
    if (!props.foundChannel && selectedChannel !== "" && selectedChannel !== id)
      socket?.emit('leave', { userId: user.id, channelId: selectedChannel });
    if (!props.foundChannel)
      dispatch(setSelectedChannel(id));
  }

   function isOwner() {
    const userFinded = props.channel.users.find((userFind: any) => userFind.id === user.id);
    return (userFinded && userFinded.role === "owner");
  }

  return (
    <>
    {
      manageMode ?
        <Manage channel={props.channel} setToggleMenu={setToggleMenu} setManageMode={setManageMode}/>
      : 
        null
    }
        <div key={props.channel["id"]} onClick={e => handleSelectChannel(props.channel["id"])}>
            <hr></hr>
                <p>{props.channel["name"]} - {props.channel["visibility"]}</p>
                <p>{formatedDate(props.channel["createdAt"])}</p>
                { props.foundChannel ? 
                  <Join channelId={props.channel["id"]} channelVisibility={props.channel["visibility"]} setSearchChannel={props.setSearchChannel} />
                  :
                  <>
                    <button ref={ref} onClick={e => setToggleMenu(!toggleMenu)}>+</button>
                    <ControlledMenu 
                      anchorRef={ref}
                      state={toggleMenu ? 'open' : 'closed'}
                    >
                      { isOwner() ? <button onClick={e => setManageMode(true)}>Manage channel</button> : null }
                      <Leave channelId={props.channel["id"]} setSearchChannel={props.setSearchChannel} />
                    </ControlledMenu>
                  </>
                }
            <hr></hr>
        </div>
    </>
  );
}

export default Channel;
