
import { useState } from 'react';
import './Channels.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from '../../Redux/authSlice';
import DMChannel from './DMChannel/DMChannel';
import { useParams } from 'react-router-dom';
import React from 'react';

interface IInvites {
    requestFrom: string;
    roomId: string;
  }
interface props {
    inviteGames: IInvites[]
}

function PrivateMessages(props: props) {
    const params = useParams();
    const [init, setInit] = useState<boolean>(false);
    const dispatch = useDispatch();
    
    const user = useSelector(getUser);

    return (
    <div className='channels'>
        <div className='channelChat dmChatHeigthChange'>
            { params.id !== undefined ? 
                <DMChannel invites={props.inviteGames}/>
                    :
                null
            }
        </div>
    </div>
  );
}

export default PrivateMessages;
