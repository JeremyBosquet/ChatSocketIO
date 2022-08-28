import { Socket } from "socket.io-client";

interface props {
  socket : Socket | undefined;
}

function GamePlay(props : props) {
  return (
      <div>
        Game : <br/>
        <canvas id="canvas" width="100%" height="100%"></canvas>
      </div>
  );
}

export default GamePlay;
