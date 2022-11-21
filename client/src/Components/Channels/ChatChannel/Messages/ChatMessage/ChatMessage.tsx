import axios from "axios";
import { useEffect, useState } from "react";
import { Imessage } from "../../interfaces/messages";
import { IuserDb } from "../../interfaces/users";
import './ChatMessage.scss';
import React from 'react';

interface props {
    userId: string;
    users: IuserDb[];
    message: Imessage;
    setUsers: any;
}

function ChatMessage(props : props) {
  const user = props.users.filter(user => user.uuid === props.message.userId)[0]?.username;

  return (
    <div className={props.message.userId === props.userId ? "message sender" : "message"}>
      <p className="messageUser">{user}</p>
      <p className="messageContent">{props.message.message}</p>
    </div>
  );
}

export default ChatMessage;