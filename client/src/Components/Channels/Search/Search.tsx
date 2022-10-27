import axios from 'axios';import { getUser } from '../../../Redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setChannels } from '../../../Redux/chatSlice';

interface props {
    searchChannel: string;
    setSearchChannel: any;
    setChannelsFind: any;
}

function Search(props: props) {
    const user = useSelector(getUser);

    const dispatch = useDispatch();

    const handleSearch = async (e: any) => {
        props.setSearchChannel(e.target.value);

        const getUsersChannel = async (e: any) => {
            await axios.get("http://localhost:4000/api/chat/channels/user/" + user.id)
            .then((res) => {
                if (res)
                    dispatch(setChannels(res.data));
            })
        }

        if (e.target.value === "")
            getUsersChannel(user.id)
        else {
            await axios.get("http://localhost:4000/api/chat/channels/byname/" + e.target.value + "/" + user.id)
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
