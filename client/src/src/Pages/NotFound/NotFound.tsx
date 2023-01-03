
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import KillSocket from "../../Components/KillSocket/KillSocket";
import './NotFound.scss'
import instance from "../../API/Instance";
import { Helmet } from "react-helmet";

function NotFound() {
	let navigate = useNavigate();
	KillSocket("all");

	return (
		<div className="NotFoundPage">
			<Helmet>
				<meta charSet="utf-8" />
				<title> 404 - transcendence </title>
			</Helmet>
			<img src={"/404.png"} alt="404"></img>
			<button onClick={() => navigate("/")}> Home </button>
		</div>
	);
}

export default NotFound;
