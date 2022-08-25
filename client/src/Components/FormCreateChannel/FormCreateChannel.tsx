import { Socket } from 'socket.io-client';
import axios from 'axios';
import { useState } from 'react';

interface Iuser {
  id: string,
  name: string
}

interface props {
  socket : Socket | undefined;
  user : Iuser;
}

function FormCreateChannel(props : props) {
  const [channelName, setChannelName] = useState<string>("");
  const [visibility, setVisibility] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  function checkVisibility(visibility : string) {
    if (visibility === "public" || visibility === "private" || visibility === "protected")
    {
      setError("Error: channel's visibility can only be (public, private or protected).");
      return (false);
    }
    return (true);
  }

  // function checkPassword(password: string) {

  // }

  const changeVisibility = (e : any) => {
    setPassword("");
    setVisibility(e.target.value);
  }


  const handleSubmit = async (e : any) => {
    e.preventDefault(); // Cancel the form submit event 

    setSuccess("");
    setError("");

    if (channelName === "") // Check if the name is empty
    {
      setError("Error: channel's name can't be empty.");
      return ;
    }

    if (!checkVisibility(visibility)) // Check channel's visibility is valid
      return ;

    const users = [
      {
        id: props.user.id,
        name: props.user.name,
        role: "owner"
      }
    ]

    axios.post('channel', { name: channelName, owner: props.user.name, visibility: visibility, password: password, users: users })
    .then((res : any) => {
        if (res.data ) {
        setSuccess("Success: channel " + channelName + " is created.");
        props.socket?.emit('channelCreated');
      }
    }
    ).catch((error : any) => {
        if (error) {
          setError("Error: please retry later.")
        }
      }
    )
  }

  return (
      <div>
        <form className="ChannelCreateForm" onSubmit={handleSubmit}>
          <input className="FormCreateChannelInput" type="text" value={channelName} onChange={e => setChannelName(e.target.value)} placeholder="Channel's name"></input>
          <select className="FormCreateChannelSelect" name="visibility" value={visibility} onChange={changeVisibility}>
            <option value="public">Public</option>
            <option value="protected" selected>Protected by password</option>
            <option value="private">Private</option>
          </select>
          {visibility === "protected" ? (
            <input className="FormCreateChannelSelect" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Channel's password"></input>
          ) : null}
          <button className="FormCreateChannelButtom" type="submit">Join chat</button>
        </form>
        <div>
          { error ? <p>{error}</p> : null }
          { success ? <p>{success}</p> : null }
        </div>
      </div>
  );
}

export default FormCreateChannel;
