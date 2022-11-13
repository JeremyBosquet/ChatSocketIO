import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastContainer, toast } from "react-toastify";

import store from './Redux/store'
import { Provider } from "react-redux";
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
(window as any).global = window;

root.render(
  <React.StrictMode>
  <Provider store={store}>
    <ToastContainer />
    <App />
    </Provider>
  </React.StrictMode>
);
