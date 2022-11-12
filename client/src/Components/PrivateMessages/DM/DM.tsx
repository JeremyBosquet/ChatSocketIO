import { useDispatch, useSelector } from 'react-redux';
import '@szhsin/react-menu/dist/core.css';
import { getSelectedChannel, getSelectedChannelDM, getSocket, setSelectedChannel, setSelectedChannelDM } from '../../../Redux/chatSlice';
import { getUser } from '../../../Redux/authSlice';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface props {
    dm: any;
}

function DM(props: props) {
  const user = useSelector(getUser);
  const socket = useSelector(getSocket);
  const selectedChannelDM = useSelector(getSelectedChannelDM);
  const [name, setName] = useState<string>("Pending...");
  let init = false;

  const dispatch = useDispatch();
  
  const handleSelectChannel = (id: string) => {
    if (selectedChannelDM !== "" && selectedChannelDM !== id) {
      socket?.emit('leave', { userId: user.id, channelId: selectedChannelDM });
    }
    dispatch(setSelectedChannelDM(id));
  }
  
  useEffect(() => {
    const getName = async () => {
      const userId = props.dm.users[0]?.id === user.id ? props.dm.users[1]?.id : props.dm.users[0]?.id;
      const u = (await axios.get(`http://localhost:4000/api/chat/user/` + userId)).data;
      if (u?.name)
        setName(u.name);
      init = true;
    }
    getName();
  }, []);

  return (
    <>
      <div key={props.dm["id"]} onClick={e => handleSelectChannel(props.dm["id"])}>
          <hr></hr>
              <p>{name}</p>
          <hr></hr>
      </div>
    </>
  );
}

export default DM;
