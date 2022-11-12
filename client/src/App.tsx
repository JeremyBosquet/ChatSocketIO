import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	BrowserRouter as Router,
	Route,
	Routes,
} from "react-router-dom";
import { io } from "socket.io-client";
import ChannelPage from "./Pages/ChannelPage/ChannelPage";
import DMPage from "./Pages/DMPage/DMPage";
import { getUser } from "./Redux/authSlice";
import { setSocket } from "./Redux/chatSlice";

function App() {
	const dispatch = useDispatch();
	const user = useSelector(getUser);

	useEffect(() => { // Connect to the socket
		const newSocket = io('http://localhost:4001');
		dispatch(setSocket(newSocket));
		newSocket.on('connect', () => {
			newSocket.emit("connected", {userId: user.id});
		});
		//eslint-disable-next-line
	}, []);

	return (
		<Router>
			<Routes>
				<Route path="/chat/channel" element={<ChannelPage />}></Route>
				<Route path="/chat/channel/:id" element={<ChannelPage />}></Route>
				<Route path="/chat/dm" element={<DMPage />}></Route>
				<Route path="/chat/dm/:id" element={<DMPage />}></Route>
				<Route path="*" element={<div>Page not found</div>}></Route>
			</Routes>
		</Router>
	);
}

export default App;
