import { Socket } from 'socket.io-client';
import Join from '../Join/Join';
import Leave from '../Leave/Leave';
import { Menu, MenuButton } from '@szhsin/react-menu';
import { useSelector, useDispatch } from 'react-redux';
import '@szhsin/react-menu/dist/core.css';
import { getSelectedChannel, setSelectedChannel } from '../../../Redux/chatSlice';

interface props {
    socket: Socket | undefined;
    user: {id: string};
    channel: any;
    setChannels: any;
    setSearchChannel: any;
    foundChannel: boolean;
    // selectedChannel: string;
    // setSelectedChannel: any;
}

function Channel(props: props) {
  const selectedChannel = useSelector(getSelectedChannel);
  const dispatch = useDispatch()

  const formatedDate = (d: any) => {
    const newDate = new Date(d);
    return (newDate.toLocaleDateString());
  }
  
  const handleSelectChannel = (id: string) => {
    if (!props.foundChannel && selectedChannel !== "" && selectedChannel !== id)
      props.socket?.emit('leave', { userId: props.user.id, channelId: selectedChannel });
    if (!props.foundChannel)
      dispatch(setSelectedChannel(id));
      // props.setSelectedChannel(id);
  }

  return (
    <>
        <div key={props.channel["id"]} onClick={e => handleSelectChannel(props.channel["id"])}>
            <hr></hr>
                <p>{props.channel["name"]} - {props.channel["visibility"]}</p>
                <p>{formatedDate(props.channel["createdAt"])}</p>
                { props.foundChannel ? 
                  <Join socket={props.socket} channelId={props.channel["id"]} channelVisibility={props.channel["visibility"]} user={props.user} setChannels={props.setChannels} setSearchChannel={props.setSearchChannel} />
                  :
                  <Menu menuButton={<MenuButton>+</MenuButton>}>
                    {/* <Leave socket={props.socket} channelId={props.channel["id"]} user={{id: props.user.id}} setChannels={props.setChannels} setSearchChannel={props.setSearchChannel} setSelectedChannel={props.setSelectedChannel} selectedChannel={props.selectedChannel}/> */}
                    <Leave socket={props.socket} channelId={props.channel["id"]} user={{id: props.user.id}} setChannels={props.setChannels} setSearchChannel={props.setSearchChannel} />
                  </Menu>
                }
            <hr></hr>
        </div>
    </>
  );
}

export default Channel;
