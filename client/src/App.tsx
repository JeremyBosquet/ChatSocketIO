import {
	BrowserRouter as Router,
	Route,
	Routes,
} from "react-router-dom";
import { useState, } from 'react';
import SignIn from "./Components/Auth/Signin";
import GetToken from "./Components/Auth/GetToken";
import HomePage from "./pages/HomePage";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Logout from "./Components/Auth/Logout";
import Parameters from "./pages/Parameters";
import TwoAuth from "./pages/TwoAuth";


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
			</Routes>
		</Router>
	);
}

export default App;
