import {
	BrowserRouter as Router,
	Route,
	Routes
} from "react-router-dom";
import GameMainPage from "./Pages/GameMainPage/GameMainPage";
import GamePlayingPage from "./Pages/GamePlayingPage/GamePlayingPage";
import HomePage from "./Pages/HomePage/HomePage";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<HomePage />}></Route>
				<Route path="/game/" element={<GamePlayingPage />}></Route>
				<Route path="/game/:id" element={<GamePlayingPage />}></Route>
				<Route path="*" element={<div>Page not found</div>}></Route>
			</Routes>
		</Router>
	);
}

export default App;
