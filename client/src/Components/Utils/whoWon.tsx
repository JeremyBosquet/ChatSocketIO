import React from "react";
interface IPlayers {
  id: string;
  name: string;
  score: number;
  status: string;
  x: number;
  y: number;
}

export function whoWon(uuid: string, game : any,) {
  	if (uuid && game.playerA && game.playerB && game.status === "finished") {
		if (game.scoreA == game.scoreB)
			return "Draw";
		if (uuid === game.playerA.id && game.scoreA > game.scoreB)
		{
			if (game.scoreB == -1)
			{
				game.scoreB = 0;
				return ("Victory by forfeit");
			}
			return "Victory";
		}
		else if (uuid === game.playerB.id && game.scoreB > game.scoreA)
		{
			if (game.scoreA == -1)
			{
				game.scoreA = 0;
				return ("Victory by forfeit")
			}
			return "Victory";
		}
		else
		{
			if (game.scoreA == -1 && uuid === game.playerA.id)
			{
				game.scoreA = 0;
				return ("Defeat by forfeit")
			}
			if (game.scoreB == -1 && uuid === game.playerB.id)
			{
				game.scoreB = 0;
				return ("Defeat by forfeit")
			}
			return "Defeat";
		}
  }
}
