import React from "react"
import {AiOutlineClose} from "react-icons/ai";
import { useNavigate } from "react-router-dom";

interface props{
	setProfileDisplayed : any;
}
function ClosePopup(props : props) {
	
	async function HideProfile()
	{
		props.setProfileDisplayed(false);
		let blur = document.getElementsByClassName('blur');
		for (let i = 0; i < blur.length ; i++)
			blur[i]?.classList.toggle('active');
		let popup = document.getElementsByClassName('popup');
		for (let i = 0; i < popup.length ; i++)
			popup[i]?.classList.toggle('active');
	}

	return (
		<button className="closeProfile" onClick={() =>  HideProfile()}>  <span><AiOutlineClose /></span> </button>
	)
}

export default ClosePopup;