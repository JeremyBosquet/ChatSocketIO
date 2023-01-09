
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUser } from "../../../Redux/userSlice";
import React from 'react';
import instance from "../../../API/Instance";
import {BiMessageDetail} from 'react-icons/bi';

interface props {
	user: any;
	myUuid: string;
}

function Dm(props: props) {

	const me = useSelector(getUser);
	const navigate = useNavigate();

	const handleDM = async (targetId: string) => {
		await instance.post(`chat/dm/`, {
			user1: props?.myUuid,
			user2: targetId,
		}).then(res => {
			if (res.data.id)
				navigate(`/chat/dm/${res.data.id}`);
		});
	}

	return (
		<button title="Dm user" onClick={() => handleDM(props?.user.uuid)}><BiMessageDetail/></button>
	);
}

export default Dm;