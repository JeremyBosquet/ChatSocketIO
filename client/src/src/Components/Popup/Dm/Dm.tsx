
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUser } from "../../../Redux/userSlice";
import React from 'react';
import instance from "../../../API/Instance";
import {BiMessageDetail} from 'react-icons/bi';

interface props {
	user: any;
}

function Dm(props: props) {

	const me = useSelector(getUser);
	const params = useParams();
	const navigate = useNavigate();

	const handleDM = async (targetId: string) => {
		if (!params.id)
			navigate('/chat/channel');

		await instance.post(`chat/dm/`, {
			user1: me.uuid,
			user2: targetId,
		}).then(res => {
			if (res.data.id)
				navigate(`/chat/dm/${res.data.id}`);
		});
	}

	return (
		<button title="Dm user" onClick={() => handleDM(props.user.uuid)}><BiMessageDetail/></button>
	);
}

export default Dm;