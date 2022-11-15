import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";


const Protected = ({children}: {children: any}) => {
	// let isLoggedIn : boolean = false;
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [mounted, setMounted] = useState(false);

	// console.log(children)
	useEffect(() => {
		const checkAuth = async () => {	
			if (localStorage.getItem("token")) {
				await axios
				.get(`http://90.66.192.148:7000/user/getLoggedInfo`, {
				  headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				  },
				})
				.then((res) => {
				  setIsLoggedIn(res.data.IsLoggedIn);
				})
				.catch((err) => {
					setIsLoggedIn(false);
				});
			}
			setMounted(true);
		}

		checkAuth();
	}, []);

	if (mounted && !isLoggedIn) {
		return <Navigate to="/" replace />;
	}
	if (mounted && isLoggedIn)
		return children;
 	<div></div>
};
export default Protected;
