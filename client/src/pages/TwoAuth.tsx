import axios from 'axios';
import { useEffect, useRef } from 'react';
import useState  from 'react-usestateref';
import SignIn from '../Components/Auth/Signin';
import { redirect, useNavigate, useLocation } from "react-router-dom"
// import { useDispatch, useSelector } from 'react-redux';
// import { getLogged, getUser, setLogged, setUser, getActivated, setActivated, getConnected, setConnected } from '../Redux/authSlice';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


function TwoAuth() {
	let navigate = useNavigate();
	let booleffect = false;
	const [print, setPrint] = useState<boolean>();
	const [authCode, setAuthCode] = useState<string>();
	const [messageCode, setmessageCode] = useState<string>();
	const token = localStorage.getItem('token');

	const booleffect2 = useRef<boolean>(true);
	const firstrender = useRef<boolean>(true);

	// const IsTwoAuthConnected = useSelector(getConnected);
	// const IsTwoAuthActivated = useSelector(getActivated);
	// const IsLoggedIn = useSelector(getLogged);
	// const User = useSelector(getUser);
	// const dispatch = useDispatch();

	const [User, setUser] = useState<any>();
	const [IsLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [IsTwoAuthActivated, setActivated] = useState<boolean>(false);
	const [IsTwoAuthConnected, setConnected] = useState<boolean>(false);

		function createNotification (type : string, message : string){
			switch (type) {
			case 'info':
				toast.info(message, {
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: "light",
					});
				break;
			case 'success':
				toast.success(message, {
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: "light",
					});
				break;
			case 'warning' :
				toast.warn(message, {
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: "light",
					});
				break;
			case 'error':
				toast.error(message, {
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: "light",
					});
			break;
			};
	}

	async function GetLoggedInfo()
	{
		if (localStorage.getItem('token'))
		{
			await axios.get(`http://45.147.97.2:5000/user/getLoggedInfo`, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
				}).then((res) => {
					setIsLoggedIn(res.data.IsLoggedIn);
					setActivated(res.data.isTwoFactorAuthenticationEnabled);
					setConnected(res.data.isSecondFactorAuthenticated);
				}).catch((err) => {
					console.log(err.message);
					setUser("{}");	
				});
		}
		booleffect2.current = false;
	}

	function setOfPrint()
	{
		console.log("wtf : " + IsLoggedIn);
		console.log( IsTwoAuthActivated);
		if (IsLoggedIn && IsTwoAuthActivated)
			setPrint(true);
		else
			setPrint(false);
	}

	const LogTwoAuth = async (event : any) => {
		event.preventDefault();
		await axios.post(`http://45.147.97.2:5000/2fa/authenticate`, {twoFactorAuthenticationCode :  authCode},{
			headers: ({
				Authorization: 'Bearer ' + token
			})
		}).then((res) => {
			console.log(res.data.message);
			createNotification('success', res.data.message);
			//setmessageCode(res.data.message);
			//GetLoggedInfo();
			navigate("/");
		}).catch((err) => {
			console.log(err.response.data.message);
			createNotification('error', err.response.data.message);
		});
		if (IsTwoAuthConnected)
		{
			await axios.get(`http://45.147.97.2:5000/user`, {
				headers: ({
					Authorization: 'Bearer ' + token,
				})
				}).then((res) => {
					setUser(JSON.stringify(res.data.User));
				});
			
		}
	}
	useEffect(() => {
		if (!booleffect)
		{
			GetLoggedInfo();
			booleffect = true;
		}
	}, []);
	useEffect(() => {
		if (firstrender.current)
		{
			firstrender.current = false;
			return;
		}
		if (!booleffect2.current)
			setOfPrint();
	}, [IsTwoAuthActivated, IsLoggedIn]);
	return (
		<div>
		{
			print  ?
			(
				<div>
					<form onSubmit={LogTwoAuth}>
						<p> Enter Google authenticator code 
							<input
							type="text"
							id="code"
							name="code"	
							required
							onChange={e => setAuthCode(e.target.value)}/>
							<button type="submit">Submit</button>
						</p>
					</form>
				<p > {messageCode} </p> 
				</div>
			)

			:

				<div>
					<p> Not logged in or two auth authentication not activated </p>
					<button onClick={() => navigate("/")}> Home </button>
				</div>
		}
		</div>
	)
}

export default TwoAuth;