import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import SignIn from "./Components/Auth/Signin";
import GetToken from "./Components/Auth/GetToken";
import HomePage from "./Pages/Home/HomePage";
import NotFound from "./Pages/NotFound";
import Logout from "./Components/Auth/Logout";
import Settings from "./Pages/Settings/Settings";
import TwoAuth from "./Pages/TwoAuth";
import axios from "axios";
import GameSpectatePage from "./Pages/GameSpectatePage/GameSpectatePage";
import React from "react";
import { getConnectedList, getSocketSocial, getUser, setConnectedList, setSocketSocial, setUser } from "./Redux/authSlice";
import { getSocket, setSocket } from "./Redux/chatSlice";
import ChannelPage from "./Pages/ChannelPage/ChannelPage";
import DMPage from "./Pages/DMPage/DMPage";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import Protected from "./Protected";
import TestPage from "./Pages/test";
//import TestPage from "./Pages/test";
//import './Pages/PhaserGame'

function App() {
  const [APIStatus, setAPIStatus] = useState<boolean>(true);
	const dispatch = useDispatch();
	const user = useSelector(getUser);
	const socketSocial = useSelector(getSocketSocial);
	const socketChat = useSelector(getSocket);
	const ConnectedList = useSelector(getConnectedList);
	
	useEffect(() => { // Connect to the socket
		if (!socketChat)
		{
			const newSocket = io('http://90.66.192.148:4001');
			dispatch(setSocket(newSocket));
		}
		// socketSocial?.removeAllListeners();
		
		//eslint-disable-next-line
	}, []);
	useEffect(() => {
		const socketSet = async () => {
			await axios.get(`http://90.66.192.148:7000/user`, {
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
			.then((res) => {
				if (res.data.User)
				{
					socketSocial?.close();
					console.log("get user and emit socket");
					const newSocketSocial = io('http://90.66.192.148:7003');
					dispatch(setSocketSocial(newSocketSocial));
					dispatch(setUser(res.data.User));
				}
			})
			
		}
		socketSet();
	}, []);
	useEffect(() => {
		if (user)
			socketSocial?.emit("connected", {uuid: user.uuid});
	}, [socketSocial]);
	useEffect(() => {
		console.log("update socket on")
		if (socketSocial)
		{
			socketSocial?.removeListener("listUsersConnected");
			console.log('la')
			socketSocial.on('listUsersConnected', (data : any) => {
				dispatch(setConnectedList(data.users));
				console.log("erererererer" , ConnectedList)
			})
			
			socketSocial?.removeListener("connectedToServer");
			socketSocial.on('connectedToServer', (data : any) => {
				console.log("test")
				dispatch(setConnectedList([...ConnectedList, data]));
			})
			
			//socketSocial?.removeListener("disconnectFromServer");
			socketSocial.on('disconnectFromServer', (data : any) => {
				console.log("Oui salade: ", ConnectedList.filter((user: any) => user.uuid !== data.uuid))
				dispatch(setConnectedList(ConnectedList.filter((user: any) => user.uuid !== data.uuid)));
			})
		}
	}, [socketSocial, ConnectedList]);
  return (
    <Router>
      {APIStatus ? (
        <Routes>
			
			<Route path="/" element={<HomePage />}></Route>
			<Route path="/login" element={<SignIn />}></Route>
			<Route path="/login/return/" element={<GetToken />}></Route>
			<Route path="/settings" element={<Settings />}></Route>
			{/* <Route path="/profile" element={<Protected><Profile /></Protected>}></Route> */}
			<Route path="/logout" element={<Protected><Logout /></Protected>}></Route>
			<Route path="/twoAuth" element={<Protected><TwoAuth /></Protected>}></Route>
			{/* <Route path="/social" element={<Protected><Social /></Protected>}></Route> */}
			{/* <Route path=":UserId" element={<Protected><Social /></Protected>}></Route> */}
			{/*</Routes>Route path="/game/" element={<Protected><GamePlayingPage /></Protected>}></Route>*/}
			{/*</Routes>Route path="/game/:roomId" element={<Protected><GamePlayingPage /></Protected>}></Route>*/}
			<Route path="/game/spectate" element={<Protected><GameSpectatePage /></Protected>}></Route>
			<Route path="/game/spectate/:roomId" element={<Protected><GameSpectatePage /></Protected>}></Route>
			<Route path="/chat/" element={<Protected><ChannelPage /></Protected>}></Route>
			<Route path="/chat/channel" element={<Protected><ChannelPage /></Protected>}></Route>
			<Route path="/chat/channel/:id" element={<Protected><ChannelPage /></Protected>}></Route>
			<Route path="/chat/dm" element={<Protected><DMPage /></Protected>}></Route>
			<Route path="/chat/dm/:id" element={<Protected><DMPage /></Protected>}></Route>
			<Route path="/test" element={<Protected><TestPage /></Protected>}></Route>
			<Route path="*" element={<NotFound />}></Route>
    </Routes>
      ) : (
        <Routes>
          <Route
            path="*"
            element={<div>{APIStatus ? "API is up" : "API is down"}</div>}
          ></Route>
        </Routes>
      )}
    </Router>
  );
}

export default App;

/* <Route path="/chat" element={<ChatPage />}></Route> */

