import { useEffect, useRef, useState } from "react";
import { Imessage } from "../interfaces/messages";
import { IuserDb } from "../interfaces/users";
import ChatMessage from "./ChatMessage/ChatMessage";
import './Messages.scss';
import React from 'react';
import axios from "axios";

interface props {
  userId: string;
  messages: Imessage[];
  users: IuserDb[];
  setUsers: any;
}

function Messages(props : props) {
  const messageEl = useRef<HTMLDivElement>(null);
  const [usersChannel, setUsersChannel] = useState<IuserDb[]>(props.users);
  let count = 0;
  useEffect(() => {
    console.log("Component messages did mount");
  }, []);

  useEffect(() => {
    const getUsername = async () => {
      let temp = usersChannel;
         for (let i = 0; i < props.messages.length; i++)
         {
           const userFinded = temp.find(user => user.uuid === props.messages[i].userId);``
           if (!userFinded)
           {
             await axios.get(`http://90.66.192.148:7000/api/chat/user/` + props.messages[i].userId).then(res => {
               if (res.data)
                 temp = [...temp, {...res.data, print: false}];
               }).catch(err => console.log(err));
           }
         }
         setUsersChannel(temp);
  }

  setTimeout(() => {
    if (messageEl.current)
      messageEl.current.scroll({top: messageEl.current.scrollHeight, behavior: 'auto'});
  }, 1)
  getUsername();
  }, [props.messages]);

  return (
    <div id="messages" className='messages' ref={messageEl}>
      {props.messages.map((message : Imessage) => (
        <ChatMessage key={Math.random()} message={message} users={usersChannel} userId={props.userId} setUsers={setUsersChannel}/>
      ))}
    </div>
  );
}

export default Messages;