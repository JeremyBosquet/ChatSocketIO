import {
	BrowserRouter as Router,
	Route,
	Routes,
} from "react-router-dom";
import { useState, } from 'react';
import SignIn from "./Components/Auth/Signin";
import GetToken from "./Components/Auth/GetToken";
import HomePage from "./Pages/HomePage";
import Profile from "./Pages/Profile";
import NotFound from "./Pages/NotFound";
import Logout from "./Components/Auth/Logout";
import Parameters from "./Pages/Parameters";
import TwoAuth from "./Pages/TwoAuth";
import GameMainPage from "./Pages/GameMainPage/GameMainPage";
import GamePlayingPage from "./Pages/GamePlayingPage/GamePlayingPage";

function App()  {
	const [IsLoggedIn , setIsLoggedIn] = useState<boolean>(false);
	return (
		<Router>
			<Routes>
				<Route path="/" element={<HomePage />}></Route>
				<Route path="/login" element={ <SignIn/>}></Route>
				<Route path="/login/return/" element={ <GetToken />}></Route>
				<Route path="/profile" element={ <Profile/>}></Route>
				<Route path="/logout" element={ <Logout/>}></Route>
				<Route path="/parameters" element={ <Parameters/>}></Route>
				{/* <Route path="/chat" element={<ChatPage />}></Route> */}
				<Route path="*" element={<NotFound/>}></Route>
				<Route path="/twoAuth" element={<TwoAuth/>}></Route>
				<Route path="/game/" element={<GamePlayingPage />}></Route>
				<Route path="/game/:id" element={<GamePlayingPage />}></Route>
			</Routes>
		</Router>
	);
}

export default App;
