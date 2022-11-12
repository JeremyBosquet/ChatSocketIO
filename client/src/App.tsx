import {
	BrowserRouter as Router,
	Route,
	Routes,
} from "react-router-dom";
import ChannelPage from "./Pages/ChannelPage/ChannelPage";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/chat/channel" element={<ChannelPage />}></Route>
				<Route path="/chat/channel/:id" element={<ChannelPage />}></Route>
				<Route path="*" element={<div>Page not found</div>}></Route>
			</Routes>
		</Router>
	);
}

export default App;
