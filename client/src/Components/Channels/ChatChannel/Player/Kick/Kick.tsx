import axios from "axios";
import { useSelector } from "react-redux";
import { getUser } from "../../../../../Redux/authSlice";
import { getSelectedChannel, getSocket } from "../../../../../Redux/chatSlice";
import { IuserDb } from "../../interfaces/users";

interface props {
    user: IuserDb;
}

function Kick(props : props) {

  const socket = useSelector(getSocket);
  const selectedChannel = useSelector(getSelectedChannel);
  const me = useSelector(getUser);

  const handleKick = async (targetId: string) => {
    await axios.post(`http://localhost:4000/api/chat/channel/kick/`, {
      channelId: selectedChannel,
      target: targetId,
      admin: me.id
    }).then(res => {
      socket?.emit("kick", {channelId: selectedChannel, target: targetId, type: "kick"});
    });
  }

  return (
    <button className="actionButton" onClick={e => handleKick(props.user.id)}>Kick</button>
  );
}

export default Kick;