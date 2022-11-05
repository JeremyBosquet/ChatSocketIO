interface IPlayers {
	id: string;
	name: string;
	score: number;
	status: string;
	x: number;
	y: number;
}

export function whoWon(uuid : string, playerA : IPlayers, playerB: IPlayers, status : string){
	if (uuid && playerA && playerB && (status === "finished"))
	{
		if (playerA.score == playerB.score)
			return  ('Draw');
		if ((uuid === playerA.id) && playerA.score > playerB.score)
			return ('Victory');
		else if ((uuid === playerB.id) && playerB.score > playerA.score)
			return ('Victory');
		if (uuid === playerA.id)
			return ('Defeat');
		return ('Defeat');
	}
}