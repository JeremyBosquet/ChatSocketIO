import { useState } from "react";
import { Socket } from "socket.io-client";

interface props {
    socket: Socket | undefined;
    channelId: string;
    user: {id: string};
}

function SendMessage(props : props) {
    const [message, setMessage] = useState<string>("");

    const handleSubmit = (e : any) => {
        e.preventDefault();
        if (message === "")
          return ;
        props.socket?.emit('message', { userId: props.user.id, message: message, channelId: props.channelId });
        setMessage("");
    }

  return (
    <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Enter message" value={message} onChange={(e) => setMessage(e.target.value)}></input>
        <button type="submit">Send</button>
    </form>
  );
}

export default SendMessage;
