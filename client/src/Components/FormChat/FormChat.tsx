import { Socket } from 'socket.io-client';
import './FormChat.scss';

interface props {
  socket : Socket | undefined;
  name : string;
  room : string;
  setName : any;
  setRoom : any; 
  setJoined: any;
}

function FormChat(props : props) {

  const handleSubmit = (e : any) => {
    e.preventDefault(); // Cancel the form submit event 

    if (props.name === "" || props.room === "") { // Check if the name and room are not empty
      alert("Please enter a name and room");
      return;
    }

    props.socket?.emit('join', { name: props.name, room: props.room }, (error : any) => { // Join the room with socket
      if(error) {
        alert(error);
        return;
      }
    } );

    props.setJoined(true); // Set the joined room state to true
  }


  return (
      <div>
        <form className="ChatJoinForm" onSubmit={handleSubmit}>
          <input className="ChatJoinInput" id="name" type="text" value={props.name} onChange={e => props.setName(e.target.value)} placeholder="Name"></input>
          <input className="ChatJoinInput" type="text" value={props.room} onChange={e => props.setRoom(e.target.value)} placeholder="Room"></input>
          <button className="ChatJoinButton" type="submit">Join chat</button>
        </form>
      </div>
  );
}

export default FormChat;
