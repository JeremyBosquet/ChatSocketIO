import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../../../../../Redux/authSlice";
import { setMode, setSelectedChannelDM } from "../../../../../Redux/chatSlice";
import { IuserDb } from "../../interfaces/users";

interface props {
    user: IuserDb;
}

function DM(props : props) {

  const dispatch = useDispatch();
  const me = useSelector(getUser);

  const handleDM = async (targetId: string) => {
    await axios.post(`http://localhost:4000/api/chat/dm/`, {
      user1: me.id,
      user2: targetId,
    }).then(res => {
      if (res.data.id)
      {
        dispatch(setSelectedChannelDM(res.data.id));
        dispatch(setMode("dm"));
      }
    });
  }

  return (
    <button className="actionButton" onClick={() => handleDM(props.user.id)}>DM</button>
  );
}

export default DM;