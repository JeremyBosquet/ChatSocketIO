import {
	BrowserRouter as Router,
	Route,
	Routes
} from "react-router-dom";
import ChatPage from "./Pages/ChatPage/ChatPage";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<ChatPage />}></Route>
				<Route path="*" element={<div>Page not found</div>}></Route>
			</Routes>
		</Router>
	);
}

export default App;
