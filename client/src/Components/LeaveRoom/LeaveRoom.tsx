import { Socket } from "socket.io-client";
import React from "react";

interface props {
  socket: Socket | undefined;
  name: string;
  room: string;
  setJoined: any;
  setRoom: any;
  setMessages: any;
  setUsers: any;
}

function LeaveRoom(props: props) {
  const handleLeaveRoom = (e: any) => {
    e.preventDefault();
    props.socket?.emit(
      "leave",
      { name: props.name, room: props.room },
      (error: any) => {
        if (error) {
          alert(error);
          return;
        }
      }
    );
    props.setJoined(false);
    props.setRoom("");
    props.setMessages([]);
    props.setUsers([]);
  };

  return <button onClick={handleLeaveRoom}>Leave room ({props.room})</button>;
}

export default LeaveRoom;
