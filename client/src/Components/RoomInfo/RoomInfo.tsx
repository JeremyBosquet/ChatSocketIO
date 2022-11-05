import React from 'react';

interface props {
  id: string;
  name: string;
  owner: string;
  nbPlayers: number;
  status: string;
  createdAt: string;
  settings: ISettings;
}

interface ISettings{
  defaultSpeed: number;
  boardWidth: number;
  boardHeight: number;
  ballRadius: number;
}

function RoomInfo(props : props) {
  function joinRoom(id : string) {
    window.location.href = `/game/${id}`;
  }
  return (
      <div key={props.id}>
        <p>Name : {props.name} | Owner : {props.owner} - {props.nbPlayers}/2 - {props.status} / {props.createdAt}
        <button onClick={() => joinRoom(props.id)}>Join</button></p>
      </div>
  );
}

export default RoomInfo;
