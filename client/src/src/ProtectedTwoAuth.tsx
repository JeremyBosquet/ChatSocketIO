
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import instance from "./API/Instance";


const ProtectedTwoAuth = ({children}: {children: any}) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const checkAuth = async () => {	
			if (localStorage.getItem("token")) {
				await instance.get(`user/CompareTokenTwoAuth`)
				.then((res) => {
					setIsLoggedIn(true);
				})
				.catch(() => {
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
export default ProtectedTwoAuth;