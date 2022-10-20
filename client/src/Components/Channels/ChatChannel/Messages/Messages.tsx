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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollTo({ behavior: "smooth" });
  };  

  useEffect(() => {
    scrollToBottom();
  }, [props.messages]);

  return (
    <div className='messages'>
      {props.messages.map((message : Imessage) => ( 
        <ChatMessage key={Math.random()} message={message} users={props.users} userId={props.userId}/>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default Messages;