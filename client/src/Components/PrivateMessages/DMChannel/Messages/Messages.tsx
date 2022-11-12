import { useEffect, useRef, useState } from "react";
import ChatMessage from "../../../Channels/ChatChannel/Messages/ChatMessage/ChatMessage";
import { Imessage } from "../interfaces/messages";
import { IuserDb } from "../interfaces/users";
import './Messages.scss';

interface props {
  userId: string;
  messages: Imessage[];
  users: IuserDb[];
  setUsers: any;
}

function Messages(props : props) {
  const messageEl = useRef<HTMLDivElement>(null);
  const [usersChannel, setUsersChannel] = useState<IuserDb[]>(props.users);

  useEffect(() => {
    setTimeout(() => {
      if (messageEl.current)
        messageEl.current.scroll({top: messageEl.current.scrollHeight, behavior: 'auto'});
    }, 1)

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