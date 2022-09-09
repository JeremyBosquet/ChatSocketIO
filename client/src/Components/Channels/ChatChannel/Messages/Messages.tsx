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

  return (
    <div className='messages'>
      {props.messages.map((message : Imessage) => ( 
        <ChatMessage message={message} users={props.users} userId={props.userId}/>
      ))}
    </div>
  );
}

export default Messages;