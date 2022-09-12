import { useEffect, useState } from "react";
import { Imessage } from "../../interfaces/messages";
import { IuserDb } from "../../interfaces/users";
import './ChatMessage.scss';

interface props {
    userId: string;
    users: IuserDb[];
    message: Imessage;
}

function ChatMessage(props : props) {
  const [user, setUser] = useState<string>("");

  useEffect(() => {
    const getUsername = async () => {
      const userFinded = await props.users.find(user => user.id === props.message.userId);
      let username = "";
      if (userFinded?.name)
        username = userFinded.name;
      setUser(username);
    }
    getUsername();
    //eslint-disable-next-line
  }, [props.users])

  return (
      <div key={props.message.id} className={props.message.userId === props.userId ? "message sender" : "message"}>
        <p className="messageUser">{user}</p>
        <p className="messageContent">{props.message.message}</p>
      </div>
  );
}

export default ChatMessage;