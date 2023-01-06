
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import instance from "./API/Instance";
import { setUser } from "./Redux/userSlice";


const ProtectedTwoAuth = ({ children }: { children: any }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [mounted, setMounted] = useState(false);
	const dispatch = useDispatch();

	useEffect(() => {
		const checkAuth = async () => {
			if (localStorage.getItem("token")) {
				await instance.get(`user/CompareTokenTwoAuth`)
					.then((res) => {
						setIsLoggedIn(true);
					})
					.catch((err) => {
						if (err.code != "ECONNABORTED")
						{
							setIsLoggedIn(false);
							localStorage.removeItem("token");
							dispatch(setUser(undefined));
						}
					});
			}
			setMounted(true);
		}
		checkAuth();
	}, [location.pathname]);

	if (mounted && !isLoggedIn) {
		
		return <Navigate to="/" replace />;
	}
	if (mounted && isLoggedIn)
	{
		return children;
	}
	<div></div>
};
export default ProtectedTwoAuth;