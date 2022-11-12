import axios from 'axios';
import { useEffect, useState } from 'react';
import './Channels.scss';
import { useSelector } from 'react-redux';
import { getSelectedChannelDM } from '../../Redux/chatSlice';
import { getUser } from '../../Redux/authSlice';
import DM from './DM/DM';
import DMChannel from './DMChannel/DMChannel';

function PrivateMessages() {
    const [init, setInit] = useState<boolean>(false);
    const [dms, setDMs] = useState<[]>([]);

    const user = useSelector(getUser);
    const selectedChannelDM = useSelector(getSelectedChannelDM);
    
    useEffect(() => {
        const getUsersDM = async (userId: any) => {
            await axios.get("http://localhost:4000/api/chat/dm/user/" + userId)
            .then((res) => {
                if (res)
                    setDMs(res.data);
                    setInit(true);
            })
        }
        
        if (!init)
            getUsersDM(user.id);
        //eslint-disable-next-line
    }, [init])

    return (
    <div className='channels'>
        <div className='channelInfos'> 
            <div className='channelInfo'>
                <h2>Private Messages</h2>
                {dms.map((dm : any) => (
                    <DM key={dm["id"]} dm={dm} />
                ))}
            </div>
            <div className='channelChat'>
                { selectedChannelDM !== "" ? 
                    <DMChannel />
                        :
                    <p>Select a player</p>
                }
            </div>
        </div>
    </div>
  );
}

export default PrivateMessages;
