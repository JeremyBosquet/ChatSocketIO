import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";

export function createNotification(type: string, message: string) {
	switch (type) {
		case "info":
			toast.info(message, {
				position: "bottom-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: false,
				draggable: true,
				progress: undefined,
				theme: "dark",
			});
			break;
		case "success":
			toast.success(message, {
				position: "bottom-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: false,
				draggable: true,
				progress: undefined,
				theme: "dark",
			});
			break;
		case "warning":
			toast.warn(message, {
				position: "bottom-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: false,
				draggable: true,
				progress: undefined,
				theme: "dark",
			});
			break;
		case "error":
			toast.error(message, {
				position: "bottom-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: false,
				draggable: true,
				progress: undefined,
				theme: "dark",
			});
			break;
	}
}
