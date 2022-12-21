import Leave from '../../Leave/Leave';
import { ControlledMenu } from '@szhsin/react-menu';
import { useSelector } from 'react-redux';
import '@szhsin/react-menu/dist/core.css';
import { getUser } from '../../../../Redux/authSlice';
import { useState } from 'react';
import { useRef } from 'react';
import React from 'react';
import '../Channel.scss';

interface props {
	channel: any;
	setSearchChannel: any;
	foundChannel: boolean;
    setManageMode: any;
}

function DevelopButton(props: props) {
    const ref = useRef(null);
    const user = useSelector(getUser);

    const [toggleMenu, setToggleMenu] = useState<boolean>(false);

    function isOwner() {
        const userFinded = props.channel.users.find((userFind: any) => userFind.id === user.uuid);
        return (userFinded && userFinded.role === "owner");
    }

  const handleClick = (e: any) => {
        e.cancelBubble = true;
        e.stopPropagation();

        setToggleMenu(!toggleMenu);
  }

  const handleManageMode = (e : any) => {
        e.cancelBubble = true;
        e.stopPropagation();
        
        props.setManageMode(true);
  }

  return (
	<>
        { !props.foundChannel ? 
        (
            <>
                <button ref={ref} onClick={e => handleClick(e)} className="developChannel">{toggleMenu ? '-' : '+'}</button>
                { toggleMenu ?
                <>
                    <ControlledMenu 
                        anchorRef={ref}
                        state={toggleMenu ? 'open' : 'closed'}
                        className="channelMenu"
                        direction='left'
                        viewScroll='close'
                        onClick={(e) => e.stopPropagation()}
                        onClose={() => setToggleMenu(false)}
                        onAuxClickCapture={() => setToggleMenu(false)}
                    >
                        { isOwner() ? <button className='channelMenuButton' onClick={e => handleManageMode(e)}>Manage channel</button> : null }
                        <Leave channelId={props.channel["id"]} setSearchChannel={props.setSearchChannel} />
                    </ControlledMenu>
                </>
                    :
                    null
                }
            </>

        ) : null}
	</>
  );
}

export default DevelopButton;
