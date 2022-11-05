import {
	BrowserRouter as Router,
	Route,
	Routes,
} from "react-router-dom";
import { useEffect, useState, } from 'react';
import SignIn from "./Components/Auth/Signin";
import GetToken from "./Components/Auth/GetToken";
import HomePage from "./Pages/Home/HomePage";
import Profile from "./Pages/Profile/Profile";
import NotFound from "./Pages/NotFound";
import Logout from "./Components/Auth/Logout";
import Settings from "./Pages/Settings";
import TwoAuth from "./Pages/TwoAuth";
import GamePlayingPage from "./Pages/GamePlayingPage/GamePlayingPage";
import axios from "axios";
import Social from "./Pages/Social/Social";
import GameSpectatePage from "./Pages/GameSpectatePage/GameSpectatePage";

import './App.css'

function App() {
	const [APIStatus, setAPIStatus] = useState<boolean>(true);

	useEffect(() => {
		const interval = setInterval(async () => {
			const result = await axios.get("http://90.66.192.148:7000/status").catch
				((err) => {
					// Not noice
					setAPIStatus(false);
				}).then((res) => {
					if (res?.data && res.data?.status && res.data.status === "ok")
						setAPIStatus(true);
					else
						setAPIStatus(false);
				});
		}, 1000);
		return () => clearInterval(interval);
	}, [APIStatus]);

	return (
		<Router>
			{APIStatus ? (
				<Routes>
					<Route path="/" element={<HomePage />}></Route>
					<Route path="/login" element={<SignIn />}></Route>
					<Route path="/login/return/" element={<GetToken />}></Route>
					<Route path="/profile" element={<Profile />}></Route>
					<Route path="/logout" element={<Logout />}></Route>
					<Route path="/settings" element={<Settings />}></Route>
					<Route path="*" element={<NotFound />}></Route>
					<Route path="/twoAuth" element={<TwoAuth />}></Route>
					<Route path="/social" element={<Social />}></Route>
					<Route path="/social/:UserId" element={<Social />}></Route>
					<Route path="/game/" element={<GamePlayingPage />}></Route>
					<Route path="/game/spectate" element={<GameSpectatePage />}></Route>
					<Route path="/game/spectate/:roomId" element={<GameSpectatePage />}></Route>
				</Routes>
			) : (
				<Routes>
					<Route path="*" element={<div>{APIStatus ? "API is up" : "API is down"}</div>}></Route>
				</Routes>
			)}
		</Router>
	);
}

export default App;

/* <Route path="/chat" element={<ChatPage />}></Route> */