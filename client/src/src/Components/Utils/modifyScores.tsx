
export function modifyScores(uuid: string, game : any, setScoreA : any, setScoreB : any, ScoreA : number[], ScoreB : number[], index : number, finished : boolean) {
	if (uuid && game.playerA && game.playerB && game.status === "finished") {
	  const newScoreATab : number[] = ScoreA;
		if (newScoreATab.length < index)
			newScoreATab.push(game.scoreA < 0 ? 0 : game.scoreA)
		else
			newScoreATab[index] = game.scoreA < 0 ? 0 : game.scoreA;
		console.log(newScoreATab);
		const newScoreBTab : number[] = ScoreB;
		if (newScoreBTab.length < index)
			newScoreBTab.push(game.scoreB < 0 ? 0 : game.scoreB)
		else
			newScoreBTab[index] = game.scoreB < 0 ? 0 : game.scoreB;
		console.log(newScoreBTab);
		if (finished)
		{
			console.log("finished");
			setScoreA(newScoreATab);
			setScoreB(newScoreBTab);
		}
	}
}