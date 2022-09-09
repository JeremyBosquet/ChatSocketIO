import { useEffect, useState } from "react";
import { Iuser, IuserDb } from "../interfaces/users";

interface props {
    user: IuserDb;
    usersConnected: Iuser[];
}

function Player(props : props) {
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    async function isConnected(user: IuserDb) {
      let userFinded = await props.usersConnected.find(userConnected => userConnected.userId === user.id);
      console.log("userFinded", userFinded);
      if (userFinded)
      {
        setConnected(true);
        return (true);
      }
      setConnected(false);
      return (false);
    }

    isConnected(props.user);
    //eslint-disable-next-line
  }, [props.usersConnected])

  return (
    <div className='player' key={Math.random()}>
      <p>{props.user?.name} - {connected ? <span>Online</span> : <span>Offline</span>}</p>
      <div>
          <button>Add friend</button>
          <button>Block</button>
      </div>
    </div>
  );
}

export default Player;