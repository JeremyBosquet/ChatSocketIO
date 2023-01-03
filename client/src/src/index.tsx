import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastContainer } from "react-toastify";

import store from './Redux/store'
import { Provider } from "react-redux";
const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);
(window as any).global = window;

root.render(
	<Provider store={store}>
		<ToastContainer />
		<App />
	</Provider>
);