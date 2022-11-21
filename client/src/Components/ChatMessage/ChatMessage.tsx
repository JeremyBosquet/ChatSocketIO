import React from "react";
interface props {
  name: string;
  message: string;
  room: string;
  date: string;
}

function ChatMessage(props: props) {
  return (
    <div key={Math.random()}>
      <p>
        {props.name} : {props.message}
      </p>
    </div>
  );
}

export default ChatMessage;
