import axios from 'axios';
import React from 'react';
import { useEffect, useState } from 'react';
import { redirect, useNavigate, useLocation } from "react-router-dom"


function SignIn() {
	let navigate = useNavigate();
	let location = useLocation();
	let booleffect = false;
  
	async function handleSubmit () {
	  const {data} = await axios.get(`http://45.147.97.2:5000/login`)
		window.location.assign(data);
	}
	useEffect(() => {
		if (!booleffect)
		{
			handleSubmit();
			booleffect = true;
		}
	}, []);

	return (
		<div>
		</div>
	)
	
			
}

export default SignIn;