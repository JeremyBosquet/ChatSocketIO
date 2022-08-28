import { useState } from "react";
import { Socket } from "socket.io-client";

interface props {
  socket : Socket | undefined;
  setReady: (ready : boolean) => void;
  setPlayerId: (playerId : string) => void;
  setPlayerName: (playerName : string) => void;
  users : IUsers[];
}

interface IUsers {
  id: string;
  name: string;
  image: string;
  createdAt: string;
}

function GameReady(props : props) {
  const [User, setUser] = useState<string>("");
  function handleReady() {
    console.log("game : ", User);
    if (!User)
      return ;
    props.setPlayerId(User);
    const test = props.users.find(user => user.id === User)?.name;
    if (test)
     props.setPlayerName(test);
    else
      props.setPlayerName("");
    props.setReady(true);
  }
  return (
      <div>
        Select an account : <br/> {/*Ready main action*/}
        <button onClick={handleReady}>Play</button>
        <select defaultValue="undefined" id="playerId" onChange={(e) => setUser(e.target.value)}>
          <option key="undefined" disabled value="undefined">Select a player</option>
          {props.users.map((user : IUsers) => {
            return <option key={user.id} value={user.id}>{user.name}</option>
          }
          )}
        </select>
      </div>
  );
}

export default GameReady;
