
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import instance from "./API/Instance";
import { setUser } from "./Redux/userSlice";


const Protected = ({ children }: { children: any }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [mounted, setMounted] = useState(false);
	const dispatch = useDispatch();

	useEffect(() => {
		const checkAuth = async () => {
			if (localStorage.getItem("token")) {
				await instance.get(`user/CompareToken`)
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

	if (mounted && (isLoggedIn || (!localStorage.getItem("token") && location.pathname === "/")))
	{
		return children;
	}
	if (mounted && !isLoggedIn) {
		return <Navigate to="/" replace />;
	}
	<div></div>
};
export default Protected;
