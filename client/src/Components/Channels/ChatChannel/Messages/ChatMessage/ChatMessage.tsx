import axios from "axios";
import { useEffect, useState } from "react";
import { Imessage } from "../../interfaces/messages";
import { IuserDb } from "../../interfaces/users";
import './ChatMessage.scss';

interface props {
    userId: string;
    users: IuserDb[];
    message: Imessage;
    setUsers: any;
}

function ChatMessage(props : props) {
  const [user, setUser] = useState<string>("");

  useEffect(() => {
    const getUsername = async () => {
        // console.log(props.message.userId);
      const userFinded = await props.users.find(user => user.id === props.message.userId);
      let username = "";
      // console.log(userFinded)
      if (userFinded?.name)
        username = userFinded.name;
      else
      {
        const user = await axios.get(`http://localhost:4000/api/chat/user/` + props.message.userId);
        username = user.data.name;
  
        props.setUsers([...props.users, {...user.data, print: false}]);
        // console.log(props.users);
      }
      setUser(username);
    }
    getUsername();
    //eslint-disable-next-line
  }, [])

  // useEffect(() => {
  //   console.log(props.users);
  // }, [props.users])

  return (
      <div className={props.message.userId === props.userId ? "message sender" : "message"}>
        <p className="messageUser">{user}</p>
        <p className="messageContent">{props.message.message}</p>
      </div>
  );
}

export default ChatMessage;