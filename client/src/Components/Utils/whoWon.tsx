import React from "react";
interface IPlayers {
  id: string;
  name: string;
  score: number;
  status: string;
  x: number;
  y: number;
}

export function whoWon(
	uuid: string,
	game : any,
) {
  if (uuid && game.playerA && game.playerB && game.status === "finished") {
    if (game.scoreA == game.scoreB) return "Draw";
    if (uuid === game.playerA.id && game.scoreA > game.scoreB) return "Victory";
    else if (uuid === game.playerB.id && game.scoreB > game.scoreA)
      return "Victory";
    if (uuid === game.playerA.id) return "Defeat";
    return "Defeat";
  }
}
