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
    axios.post(`http://localhost:5000/api/room/createRoom`, { name: roomName, nbPlayers: NbPlayers, owner: Owner, status: Status })
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
