import {
	BrowserRouter as Router,
	Route,
	Routes
} from "react-router-dom";
import ChatPage from "./Pages/ChatPage/ChatPage";
import HomePage from "./Pages/HomePage/HomePage";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<HomePage />}></Route>
				<Route path="/chat" element={<ChatPage />}></Route>
				<Route path="*" element={<div>Page not found</div>}></Route>
			</Routes>
		</Router>
	);
}

export default App;
