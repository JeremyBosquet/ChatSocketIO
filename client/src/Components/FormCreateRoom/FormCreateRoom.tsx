import { Socket } from 'socket.io-client';
import axios from 'axios';
import { useState } from 'react';

interface props {
  socket : Socket | undefined;
}

function FormCreateRoom(props : props) {
  const [roomName, setRoomName] = useState<string>("");
  const [NbPlayers, setNbPlayers] = useState<number>(0);
  const [Owner, setOwner] = useState<string>("");
  const [Status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [defaultSpeed, setDefaultSpeed] = useState<number>(0.2);
  const [defaultDirection, setdefaultDirection] = useState<number>(Math.random() * 2 * Math.PI);
  const [boardWidth, setBoardWidth] = useState<number>(0.015);
  const [boardHeight, setBoardHeight] = useState<number>(0.20);
  const [ballRadius, setBallRadius] = useState<number>(0.020);

  
  const handleSubmit = async (e : any) => {
    e.preventDefault(); // Cancel the form submit event 
    setSuccess("");
    setError("");
    if (roomName === "" || Owner === "")
    {
      setError("Error: room's name, number of players and owner can't be empty.");
      return ;
    }
    console.log(e.target.name.value)
    axios.post(`http://45.147.97.2:5000/api/room/createRoom`, { name: roomName, nbPlayers: NbPlayers, owner: Owner, status: Status, settings:  { defaultSpeed: defaultSpeed, defaultDirection: defaultDirection, boardWidth: boardWidth, boardHeight: boardHeight, ballRadius: ballRadius }})
    .then(res => {
      console.log("success");
      props.socket?.emit('roomCreated');
      setSuccess("Success: room " + e.target.name.value + " is created.");
    }).catch(err => {
      console.log(err);
      setError("Error: room " + e.target.name.value + " already exists or not valid.");
    })
  }
  return (
      <div>
        <form className="ChannelRoomForm" onSubmit={handleSubmit}>
          <div className="ChannelRoomFormInput-Name">
            <label htmlFor="roomName">roomName </label>
            <input type="text" id="roomName" name="name" onChange={(e) => setRoomName(e.target.value)} />
          </div>
          <div className="ChannelRoomFormInput-NbPlayers">
            <label htmlFor="NbPlayers">NbPlayers </label>
            <input min="0" max="0" defaultValue="0" type="number" id="NbPlayers" name="name" onChange={(e) => setNbPlayers(e.target.valueAsNumber)} />
          </div>
          <div className="ChannelRoomFormInput-Owner">
            <label htmlFor="Owner">Owner </label>
            <input type="text" id="Owner" name="name" onChange={(e) => setOwner(e.target.value)} />
          </div>
          <div className="ChannelRoomFormInput-Status">
            <label htmlFor="Status">Status </label>
            <input type="text" id="Owner" name="name" onChange={(e) => setStatus(e.target.value)} />
          </div>
          <div className="ChannelRoomFormInput-DefaultSpeed">
            <label htmlFor="DefaultSpeed">DefaultSpeed </label>
            <input defaultValue={defaultSpeed} type="number" id="DefaultSpeed" name="name" onChange={(e) => setDefaultSpeed(e.target.valueAsNumber)} />
          </div>
          <div className="ChannelRoomFormInput-DefaultSpeed">
            <label htmlFor="defaultDirection">defaultDirection </label>
            <input defaultValue={defaultDirection} type="number" id="DefaultDirection" name="name" onChange={(e) => setdefaultDirection(e.target.valueAsNumber)} />
          </div>
          <div className="ChannelRoomFormInput-BoardWidth">
            <label htmlFor="BoardWidth">BoardWidth </label>
            <input defaultValue={boardWidth} type="number" id="BoardWidth" name="name" onChange={(e) => setBoardWidth(e.target.valueAsNumber)} />
          </div>
          <div className="ChannelRoomFormInput-BoardHeight">
            <label htmlFor="BoardHeight">BoardHeight </label>
            <input defaultValue={boardHeight} type="number" id="BoardHeight" name="name" onChange={(e) => setBoardHeight(e.target.valueAsNumber)} />
          </div>
          <div className="ChannelRoomFormInput-BallRadius">
            <label htmlFor="BallRadius">BallRadius </label>
            <input defaultValue={ballRadius} type="number" id="BallRadius" name="name" onChange={(e) => setBallRadius(e.target.valueAsNumber)} />
          </div>
          <button className="FormCreateRoomButtom" type="submit">Create Room</button>
        </form>
        <div>
          { error ? <p>{error}</p> : null }
          { success ? <p>{success}</p> : null }
        </div>
      </div>
  );
}

export default FormCreateRoom;
