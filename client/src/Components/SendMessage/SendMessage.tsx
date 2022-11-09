import { useState } from "react";
import { Socket } from "socket.io-client";
import React from "react";

interface props {
  socket: Socket | undefined;
  name: string;
  room: string;
}

function SendMessage(props: props) {
  const [message, setMessage] = useState<string>("");
  const [sended, setSended] = useState<boolean>(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSended(false);
    props.socket?.emit(
      "message",
      {
        name: props.name,
        message: message,
        room: props.room,
        date: new Date().getHours() + ":" + new Date().getMinutes(),
      },
      () => {
        setSended(true);
        setMessage("");
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></input>
      <button type="submit">Send</button>
      {sended && <p>Message sended.</p>}
    </form>
  );
}

export default SendMessage;
