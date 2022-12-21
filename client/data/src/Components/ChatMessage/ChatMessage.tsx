import React from "react";
interface props {
  name: string;
  message: string;
  room: string;
  date: string;
  id: number;
}

function ChatMessage(props: props) {
  return (
    <div key={props.id}>
      <p>
        {props.name} : {props.message}
      </p>
    </div>
  );
}

export default ChatMessage;
