import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom"
// import { useDispatch, useSelector } from 'react-redux';
// import { getLogged, getUser, setLogged, setUser, getActivated, setActivated, getConnected, setConnected } from '../Redux/authSlice';

function HomePage() {
	let navigate = useNavigate();
	//const [user, setUser] = useState<any>();
	let booleffect = false;

	// const IsLoggedIn = useSelector(getLogged);
	// const IsTwoAuthConnected = useSelector(getConnected);
	// const IsTwoAuthActivated = useSelector(getActivated);
	// const User = useSelector(getUser);
	// const dispatch = useDispatch();

	
	const [User, setUser] = useState<any>();
	const [IsLoggedIn, setLogged] = useState<boolean>();
	const [IsTwoAuthActivated, setActivated] = useState<boolean>();
	const [IsTwoAuthConnected, setConnected] = useState<boolean>();

	async function GetLoggedInfoAndUser()
	{
		if (localStorage.getItem('token'))
		{
			await axios.get(`http://45.147.97.2:5000/user/getLoggedInfo`, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
				}).then((res) => {
					setLogged(res.data.IsLoggedIn);
					setActivated(res.data.isTwoFactorAuthenticationEnabled);
					setConnected(res.data.isSecondFactorAuthenticated);
				}).catch((err) => {
					console.log(err.message);
					setUser("{}");	
				});
				await axios.get(`http://45.147.97.2:5000/user`, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
				}).then((res) => {
					setUser(JSON.stringify(res.data.User));
				}).catch((err) => {
					console.log(err.message);
					setUser("{}");	
				});
		}
	}

	useEffect(() => {
		if (!booleffect)
		{
			GetLoggedInfoAndUser();
			booleffect = true;
		}
	}, []);
	return (
		<div>
		{
			(User) ?
			(
				<div>
				{
					User === "{}" ?
					(
						<div>
							<button onClick={() => navigate("/login")}> login </button>
						</div>
					)

					:
						<div>
							<button onClick={() => navigate("/profile")}> Profile </button>
							<button onClick={() => navigate("/parameters")}> Parameters </button>
							<button onClick={() => navigate("/logout")}> Logout </button>
						</div>
				}
				</div>
			)

			:

			<div>
				<button onClick={() => navigate("/login")}> login </button>
			</div>
		}
		</div>
	)
}

export default HomePage;