import axios from "axios";
import { useEffect, useState } from "react";
import { Imessage } from "../../interfaces/messages";
import { IuserDb } from "../../interfaces/users";
import './ChatMessage.scss';
import React from 'react';

interface props {
    userId: string;
    users: IuserDb[];
    message: Imessage;
    setUsers: any;
}

function ChatMessage(props : props) {
  const [user, setUser] = useState<string>(".");
  
  useEffect(() => {
    const getUsername = async () => {
      const userFinded = props.users.find(user => user.uuid === props.message.userId);
      let username = ".";
      
      if (userFinded?.username)
        username = userFinded.username;
      else
      {
        await axios.get(`http://90.66.192.148:7000/api/chat/user/` + props.message.userId).then(res => {
          if (res.data)
            username = res.data.username;
            props.setUsers([...props.users, {...res.data, print: false}]);
        }).catch(err => console.log(err));
      }
      setUser(username);
    }
    if (props.message?.userId)
      getUsername();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
      <div className={props.message.userId === props.userId ? "message sender" : "message"}>
        <p className="messageUser">{user}</p>
        <p className="messageContent">{props.message.message}</p>
      </div>
  );
}

export default ChatMessage;