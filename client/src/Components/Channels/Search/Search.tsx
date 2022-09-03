import { Socket } from 'socket.io-client';
import axios from 'axios';;

interface props {
    socket: Socket | undefined;
    searchChannel: string;
    user: {id: string};
    setChannels: any;
    setSearchChannel: any;
    setChannelsFind: any;
}

function Search(props: props) {

    const handleSearch = async (e: any) => {
        props.setSearchChannel(e.target.value);

        const getUsersChannel = async (e: any) => {
            await axios.get("http://localhost:4000/api/chat/channels/user/" + props.user.id)
            .then((res) => {
                if (res)
                    props.setChannels(res.data);
            })
        }

        if (e.target.value === "")
            getUsersChannel(props.user.id)
        else {
            await axios.get("http://localhost:4000/api/chat/channels/byname/" + e.target.value + "/" + props.user.id)
            .then((res) => {
                if (res)
                    props.setChannelsFind(res.data);
            })
        }
    }
    
  return (
    <>
        <input type="text" value={props.searchChannel} onChange={e => handleSearch(e)}/>
    </>
  );
}

export default Search;
