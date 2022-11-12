import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUser } from "../../../../../Redux/authSlice";
import { getSocket } from "../../../../../Redux/chatSlice";
import { IuserDb } from "../../interfaces/users";

interface props {
    user: IuserDb;
    users: IuserDb[];
    setUsers: any;
}

function Admin(props : props) {

  const socket = useSelector(getSocket);
  const me = useSelector(getUser);

  const params = useParams();
  const navigate = useNavigate();
  const selectedChannel = params.id || "";

  
  const setAdmin = async (targetId: string) => {
    if (!params.id)
      navigate('/chat/channel');

    await axios.post(`http://localhost:4000/api/chat/channel/setadmin/`, {
      channelId: selectedChannel,
      target: targetId,
      owner: me.id
    }).then(() => {
      props.setUsers(props.users.map(user => {
        if (user.id === targetId)
          user.role = "admin";
          return user;
        }));
        
        socket?.emit("admin", {channelId: selectedChannel, target: targetId, type: "promote"});
      });
  }

  const unsetAdmin = async (targetId: string) => {
    await axios.post(`http://localhost:4000/api/chat/channel/unsetadmin/`, {
      channelId: selectedChannel,
      target: targetId,
      owner: me.id
    }).then(res => {
      props.setUsers(props.users.map(user => {
        if (user.id === targetId)
          user.role = "default";
        return user;
      }));

      socket?.emit("admin", {channelId: selectedChannel, target: targetId, type: "downgrade"});
    });
  }

  return (
    <>
      {
        props.user.role === "admin" ?
          <button className="actionButton" onClick={() => unsetAdmin(props.user.id)}>Unset Admin</button> 
        :
          <button className="actionButton" onClick={() => setAdmin(props.user.id)}>Set Admin</button>
      }
    </>
  );
}

export default Admin;