import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getConnectedList, getInGameList } from '../../Redux/userSlice';
import { GoPrimitiveDot } from 'react-icons/go';
import React from 'react';

interface Props {
	uuid: string;
}
function IsOnline(props: Props) {
	const ConnectedList = useSelector(getConnectedList);
	const inGameList = useSelector(getInGameList);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [isInGame, setIsInGame] = useState<boolean>(false);

	useEffect(() => {
		if (ConnectedList && ConnectedList.length > 0)
			setIsConnected(ConnectedList.find((userInList: any) => userInList.uuid === props?.uuid) ? true : false);
		else
			setIsConnected(false);
	}, [ConnectedList]);

	useEffect(() => {
		if (inGameList && inGameList.length > 0)
			setIsInGame(inGameList.find((userInList: any) => userInList.uuid === props?.uuid) ? true : false);
		else
			setIsInGame(false);
	}, [inGameList]);

	return (
		<>
			{isInGame ?
				<span className={"Yellow"}> <GoPrimitiveDot /> </span>
				:

				isConnected ?
					<span className={"Green"}> <GoPrimitiveDot /> </span>

					:

					<span className={"Red"}> <GoPrimitiveDot /> </span>
			}
		</>
	)
}

export default IsOnline;
