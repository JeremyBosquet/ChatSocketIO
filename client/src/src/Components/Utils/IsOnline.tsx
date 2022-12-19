import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getConnectedList } from '../../Redux/authSlice';
import { GoPrimitiveDot } from 'react-icons/go';
import React from 'react';

interface Props {
	uuid : string;
}
function IsOnline(props : Props) {
	const ConnectedList = useSelector(getConnectedList);
	const [isConnected, setIsConnected] = useState<boolean>(false);

	useEffect(() => {
		if (ConnectedList && ConnectedList.length > 0)
			setIsConnected(ConnectedList.find((userInList : any) => userInList.uuid === props?.uuid) ? true : false);
		else
			setIsConnected(false);
		console.log(ConnectedList);
	}, [ConnectedList]);

  return (
	<>
	{isConnected ?
			<span className={"Green"}> <GoPrimitiveDot/> </span>
		:
			<span className={"Red"}> <GoPrimitiveDot/> </span>
	}
	</>
  )
}

export default IsOnline;
