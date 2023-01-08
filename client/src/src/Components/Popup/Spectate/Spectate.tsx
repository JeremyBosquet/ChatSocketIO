import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getInGameList } from '../../../Redux/userSlice';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsFillEyeFill } from "react-icons/bs";

interface Props {
	uuid: string;
}

function Spectate(props: Props) {
	const inGameList = useSelector(getInGameList);
	const [isInGame, setIsInGame] = useState<boolean>(false);
	const [gameUuid, setGameUuid] = useState<string>("");
	const navigate = useNavigate();

	useEffect(() => {
		if (inGameList && inGameList.length > 0)
		{
			const find = inGameList.find((userInList: any) => userInList.uuid === props?.uuid);
			if (find)
			{
				setGameUuid(find.gameId);
				setIsInGame(true);
			}
			else
				setIsInGame(false);
		}
			else
			setIsInGame(false);
	}, [inGameList]);

	return (
		<>
			{isInGame ?
					<button title="Spectate user" onClick={() => navigate(`/game/spectate/${gameUuid}`)}><BsFillEyeFill/></button>
				:
					null
			}
		</>
	)
}

export default Spectate;
