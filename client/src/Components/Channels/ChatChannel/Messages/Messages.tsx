import { useEffect, useRef } from "react";
import { Imessage } from "../interfaces/messages";
import { IuserDb } from "../interfaces/users";
import ChatMessage from "./ChatMessage/ChatMessage";
import './Messages.scss';

interface props {
  userId: string;
  messages: Imessage[];
  users: IuserDb[];
}

function Messages(props : props) {
  const messageEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (messageEl.current)
        messageEl.current.scroll({top: messageEl.current.scrollHeight, behavior: 'auto'});
    }, 1)
  }, [props.messages]);

  return (
    <div id="messages" className='messages' ref={messageEl}>
      {props.messages.map((message : Imessage) => ( 
        <ChatMessage key={Math.random()} message={message} users={props.users} userId={props.userId}/>
      ))}
    </div>
  );
}

export default Messages;