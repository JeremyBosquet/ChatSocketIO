export function whoWon(uuid: string, game : any) {
  	if (uuid && game.playerA && game.playerB && game.status === "finished") {
		//setScoreB(newScoreBTab.push(game.scoreB));
		if (game.scoreA == game.scoreB)
			return "Draw";
		if (uuid === game.playerA.id && game.scoreA > game.scoreB)
		{
			if (game.scoreB < 0)
			{
				return ("Victory by forfeit");
			}
			return "Victory";
		}
		else if (uuid === game.playerB.id && game.scoreB > game.scoreA)
		{
			if (game.scoreA < 0)
			{
				// game.newScoreA = 0;
				return ("Victory by forfeit")
			}
			return "Victory";
		}
		else
		{
			if (game.scoreA < 0 && uuid === game.playerA.id)
			{
				return ("Defeat by forfeit")
			}
			if (game.scoreB < 0 && uuid === game.playerB.id)
			{
				return ("Defeat by forfeit")
			}
			return "Defeat";
		}
  }
}
