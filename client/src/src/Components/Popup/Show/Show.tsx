import React from "react"
import { getBlockList, getFriendList, getHistoryList, getProfileDisplayed, getProfilePage, getRequestedList, getRequestList, getSocketSocial, setBlockList, setFriendList, setHistoryList, setProfileDisplayed, setProfilePage, setRequestedList, setRequestList } from "../../../Redux/userSlice";
import { useDispatch, useSelector } from "react-redux";

import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import instance from "../../../API/Instance";

interface props {
	trueUsername : string;
}

function Show(props : props) {

	return (
		<Link title="See profile" to={"/profile/" + props.trueUsername}><FaUserCircle/> </Link>
	);
}

export default Show;