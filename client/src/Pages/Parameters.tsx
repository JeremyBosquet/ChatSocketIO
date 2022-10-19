import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import SignIn from '../Components/Auth/Signin';
import { redirect, useNavigate, useLocation } from "react-router-dom"
//import { userInfo } from 'os';
// import { useDispatch, useSelector } from 'react-redux';
// import { getLogged, getUser, setLogged, setUser, getActivated, setActivated, getConnected, setConnected } from '../Redux/authSlice';


function Parameters() {
	let navigate = useNavigate();
	let booleffect = false;
	const [changename, setChangename] = useState<string>();
	const [changeavatar, setChangeavatar] = useState<any>();

	const [QrCode, setQrCode] = useState<Blob>();
	const [TurnedOff, setTurnedOff] = useState<boolean>();
	const [authCode, setAuthCode] = useState<string>();
	const [messageImg, setMessageImg] = useState<string>();
	const [messageAvatar, setMessageAvatar] = useState<string>();
	const [messageQrCode, setmessageQrCode] = useState<string>();
	const [messageCode, setmessageCode] = useState<string>();
	const [MessageDeactivate, setMessageDeactivate] = useState<string>();
	const token = localStorage.getItem('token');

	const booleffect2 = useRef<boolean>(true);
	const firstrender = useRef<boolean>(true);

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
			await axios.get(`http://localhost:5000/user/getLoggedInfo`, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
				}).then((res) => {
					setLogged(res.data.IsLoggedIn);
					setActivated(res.data.isTwoFactorAuthenticationEnabled);
					setConnected(res.data.isSecondFactorAuthenticated);

					console.log(IsTwoAuthActivated)
				}).catch((err) => {
					console.log(err.message);
					setUser("{}");	
				});
				await axios.get(`http://localhost:5000/user`, {
					headers: ({
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					})
				}).then((res) => {
					setUser(JSON.stringify(res.data.User));
					console.log(res.data.User);
				}).catch((err) => {
					console.log(err.message);
					setUser("{}");	
				});
		}
		booleffect2.current = false;
	}

	function setOfAuthStatus()
	{
		setTurnedOff(true);
	}

	const DeactivatedTwoAuth = async (event : any) => {
		event.preventDefault();
		await axios.post(`http://localhost:5000/2fa/turn-off`, {twoFactorAuthenticationCode :  authCode}, {
			headers: ({
				Authorization: 'Bearer ' + token
			}),		
		}).then((res) => {
			console.log(res.data.message);
			GetLoggedInfoAndUser()
			setMessageDeactivate("two auth auth succefully deactivated");
		}).catch((err) => {
			console.log(err.message);
			setMessageDeactivate(err.response.data.message);
		});
	}
	const ChangeUsername = async (event : any) => {
		event.preventDefault();
		console.log(changename);
		await axios.post(`http://localhost:5000/user/changeUsername`, {newName : changename}, {
			headers: ({
				Authorization: 'Bearer ' + token
			}),
			
		}).then((res) => {
			console.log(res.data.message);
			GetLoggedInfoAndUser()
			setMessageImg("Username succefuly changed");
		}).catch((err) => {
			console.log(err);
			setMessageImg(err.response.data.message);
		});
	}
	const ChangeAvatar = async (event : any) => {
		event.preventDefault();
		//console.log(changeavatar);
		const data = new FormData();
		data.append('file', changeavatar, changeavatar.name);
		console.log(data.get('file'));
		await axios({
			method : "post",
			url : `http://localhost:5000/user/changeAvatar`,
			data : data,
			headers: {Authorization: 'Bearer ' + token,
			'Content-Type': 'multipart/form-data' },
			
		}).then((res) => {
			console.log(res.data.message);
			GetLoggedInfoAndUser()
			setMessageAvatar("Avatar succefuly changed");
		}).catch((err) => {
			console.log(err.response.data.message);
			setMessageAvatar("");
		});
	}

	const GetQrCode = async (event : any) => {
		event.preventDefault();
		await axios.post(`http://localhost:5000/2fa/generate`, {},{
			headers: ({
				Authorization: 'Bearer ' + token
			}),
			responseType: 'blob'
		})
		.then((res) => {
			setQrCode(res.data)
		}).catch((err) => {
			console.log(err.response.data.message);
			setmessageQrCode("Failed to get Qr Code");
		});
	}

	const ActivateTwoAuth = async (event : any) => {
		event.preventDefault();
		await axios.post(`http://localhost:5000/2fa/turn-on`, {twoFactorAuthenticationCode :  authCode},{
			headers: ({
				Authorization: 'Bearer ' + token
			})
		}).then((res) => {
			console.log(res.data.message);
			GetLoggedInfoAndUser()
			setmessageCode(res.data.message);
		}).catch((err) => {
			console.log(err.response.data.message);
			setmessageCode(err.response.data.message)
			return ;
		});

		await axios.post(`http://localhost:5000/2fa/authenticate`, {twoFactorAuthenticationCode :  authCode},{
			headers: ({
				Authorization: 'Bearer ' + token
			})
		}).then((res) => {
			console.log(res.data.message);
			setmessageCode(res.data.message);
			GetLoggedInfoAndUser()
		}).catch((err) => {
			console.log(err.response.data.message);
			setmessageCode(err.response.data.message)
			return ;
		});
	}

	useEffect(() => {
		if (!booleffect)
		{
			GetLoggedInfoAndUser()
			booleffect = true;
		}
	}, []);
	return (
		<div>
		{
			!(booleffect2.current) ?
			(
				<div>
				{
					(User) ?
					(
						<div>
						{
							!(User === "{}") ?
							(
								<div>
									<p> Current username : {JSON.parse(User).username} </p>
										<form onSubmit={ChangeUsername}>
											<p> New Username : &nbsp;
												<input
												type="text"
												id="name"
												name="name"	
												required
												minLength={2}
												maxLength={14}
												onChange={e => setChangename(e.target.value)}/>
												<button type="submit">Submit</button>
											</p>
										</form>
									<p > {messageImg} </p> 
									<p> Current Avatar : 
										<img src={JSON.parse(User).image} alt="user_img" width="96" height="64"/><br></br>
									</p>
									<form onSubmit={ChangeAvatar}>
											<p> New Avatar : &nbsp;
												<input
												type="file"
												id="avatar"
												name="avatar"
												required
												onChange={e => e.target.files != null ? setChangeavatar(e.target.files[0]) : ''}/>
												<button type="submit">Submit</button>
											</p>
										</form>
									<p > {messageAvatar} </p>
									<div>
									{
										!IsTwoAuthActivated ?
										(
											<div>
												<button onClick={e => GetQrCode(e)}>Activate two auth login </button><br></br>
												<p> {messageQrCode}</p>
											</div>
										)

										:

										<p></p>
									}
									</div>
									<div>
									{
										!IsTwoAuthActivated ?
										(
											QrCode ?
											(
												<div>
													<img src={URL.createObjectURL(QrCode)} alt="QrCode"/><br></br>
													<form onSubmit={ActivateTwoAuth}>
														<p> Please enter your 6 digit code after scanning the QRCODE in the Google Authenticator app : &nbsp;
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
												<p></p>
										)

										:

											<div>
												<button onClick={setOfAuthStatus}> Desactivate two auth </button><br></br>
												<div>
													<div>
													{
														TurnedOff ?
														(
															<div>
																<form onSubmit={DeactivatedTwoAuth}>
																	<p> Please enter your 6 digit code to deactivate two auth authentication : &nbsp;
																		<input
																		type="text"
																		id="code"
																		name="code"	
																		required
																		onChange={e => setAuthCode(e.target.value)}/>
																		<button type="submit">Submit</button>
																	</p>
																</form>
																<p > {MessageDeactivate} </p>
															</div>
														)

														:

														<p></p>
													}
													</div>
												</div>
											</div>
									}
									</div>
										<button onClick={() => navigate("/")}> Home </button>
									</div>
							)
							:
								<div>
									<p> User not found </p>
									<button onClick={() => navigate("/")}> Home </button>
								</div>
						}
						</div>

					)

					:
					<div>
						<p> User not found </p>
						<button onClick={() => navigate("/")}> Home </button>
					</div>

				}
				</div>
			)
			:
				<p> Loading .... </p>
		}
		</div>
	)
}

export default Parameters;