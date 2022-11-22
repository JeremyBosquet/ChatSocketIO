import axios from "axios";
import { useEffect, useRef, useState } from "react";
import SignIn from "../../Components/Auth/Signin";
import { redirect, useNavigate, useLocation } from "react-router-dom";
//import { userInfo } from 'os';
// import { useDispatch, useSelector } from 'react-redux';
// import { getLogged, getUser, setLogged, setUser, getActivated, setActivated, getConnected, setConnected } from '../Redux/authSlice';
// import {NotificationContainer, NotificationManager} from 'react-notification';
// import { ToastContainer, toast } from 'react-toastify';
// import "react-toastify/dist/ReactToastify.css";
import { createNotification } from "../../Components/notif/Notif";
import React from "react";
import NavBar from "../../Components/Nav/NavBar";
import KillSocket from "../../Components/KillSocket/KillSocket";

function Settings() {
  KillSocket("all");
  let navigate = useNavigate();
  let booleffect = false;
  const [changename, setChangename] = useState<string>();
  const [changeavatar, setChangeavatar] = useState<any>();

  const [QrCode, setQrCode] = useState<Blob>();
  const [TurnedOff, setTurnedOff] = useState<boolean>(false);
  const [authCode, setAuthCode] = useState<string>();
  const token = localStorage.getItem("token");

  const [booleffect2, setbooleffect2] = useState<boolean>(true);
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


  const [friendList, SetFriendList] = useState<any[]>([]);
	const [blockList, SetBlockList] = useState<any[]>([]);
	const [requestedList, SetRequestedList] = useState<any[]>([]);
	const [requestList, SetRequestList] = useState<any[]>([]);
	const [profilePage, setProfilePage] = useState<any>(null);
	const [profileDisplayed, setProfileDisplayed] = useState<boolean>(false);
	const [historyList, SetHistoryList] = useState<any[]>([]);

  async function GetLoggedInfoAndUser() {
    if (localStorage.getItem("token")) {
      await axios
        .get(`http://90.66.192.148:7000/user/getLoggedInfo`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((res) => {
          setLogged(res.data.IsLoggedIn);
          setActivated(res.data.isTwoFactorAuthenticationEnabled);
          setConnected(res.data.isSecondFactorAuthenticated);

          console.log(IsTwoAuthActivated);
        })
        .catch((err) => {
          console.log(err.message);
          setUser("{}");
        });
      await axios
        .get(`http://90.66.192.148:7000/user`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((res) => {
          setUser(res.data.User);
          console.log(res.data.User);
        })
        .catch((err) => {
          console.log(err.message);
          setUser(undefined);
          createNotification("error", "User not found");
          navigate("/");
        });
    } else {
      createNotification("error", "User not found");
      navigate("/");
    }
    setbooleffect2(false);
  }

  function setOfAuthStatus() {
    setTurnedOff(true);
  }

  const DeactivatedTwoAuth = async (event: any) => {
    event.preventDefault();
    await axios
      .post(
        `http://90.66.192.148:7000/2fa/turn-off`,
        { twoFactorAuthenticationCode: authCode },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      )
      .then((res) => {
        console.log(res.data.message);
        GetLoggedInfoAndUser();
        createNotification("success", "two auth auth succefully deactivated");
      })
      .catch((err) => {
        console.log(err.message);

        createNotification("error", err.response.data.message);
      });
    setTurnedOff(false);
  };
  const ChangeUsername = async (event: any) => {
    event.preventDefault();
    console.log(changename);
    await axios
      .post(
        `http://90.66.192.148:7000/user/changeUsername`,
        { newName: changename },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      )
      .then((res) => {
        console.log(res.data.message);
        GetLoggedInfoAndUser();
        createNotification("success", "Username succefuly changed");
      })
      .catch((err) => {
        createNotification(
          "error",
          err.response.data.message
        );
      });
  };
  const ChangeAvatar = async (event: any) => {
    event.preventDefault();
    //console.log(changeavatar);
    const data = new FormData();
    data.append("file", changeavatar, changeavatar.name);
    console.log(data.get("file"));
    await axios({
      method: "post",
      url: `http://90.66.192.148:7000/user/changeAvatar`,
      data: data,
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "multipart/form-data",
      },
    })
      .then((res) => {
        console.log(res);
        console.log(res.data.message);
        GetLoggedInfoAndUser();
        createNotification("success", "Avatar succefully changed");
        //setMessageAvatar("Avatar succefuly changed");
      })
      .catch((err) => {
        console.log(err);
        console.log(err.response.statusText);
        createNotification("error", err.response.statusText);
        //setMessageAvatar("");
      })
      .finally(() => {});
  };

  const GetQrCode = async (event: any) => {
    event.preventDefault();
    await axios
      .post(
        `http://90.66.192.148:7000/2fa/generate`,
        {},
        {
          headers: {
            Authorization: "Bearer " + token,
          },
          responseType: "blob",
        }
      )
      .then((res) => {
        setQrCode(res.data);
      })
      .catch((err) => {
        console.log(err.response.statusText);
        createNotification("error", err.response.statusText);
      });
  };

  const ActivateTwoAuth = async (event: any) => {
    event.preventDefault();
    await axios
      .post(
        `http://90.66.192.148:7000/2fa/turn-on`,
        { twoFactorAuthenticationCode: authCode },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      )
      .then((res) => {
        console.log(res.data.message);
        GetLoggedInfoAndUser();
        //createNotification('success', res.data.message);
      })
      .catch((err) => {
        // console.log(err.response.data.message);
        // createNotification('error', err.response.data.message);
      });

    await axios
      .post(
        `http://90.66.192.148:7000/2fa/authenticate`,
        { twoFactorAuthenticationCode: authCode },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      )
      .then((res) => {
        console.log(res.data.message);
        createNotification("success", res.data.message);
        GetLoggedInfoAndUser();
      })
      .catch((err) => {
        console.log(err.response.data.message);
        createNotification("error", err.response.data.message);
      });
  };

  useEffect(() => {
    if (!booleffect) {
      GetLoggedInfoAndUser();
      booleffect = true;
    }
  }, []);
  return (
    <div>
      {!booleffect2 ? (
        <div>
          {User ? (
            <div>
              {!(User === undefined) ? (
                <div>
                  <NavBar 
					socket={null}
					setSocket={null}
					friendList={friendList}
					SetFriendList={SetFriendList}
					blockList={blockList}
					SetBlockList={SetBlockList}
					requestList={requestList}
					SetRequestList={SetRequestList}
					requestedList={requestedList}
					SetRequestedList={SetRequestedList}
					setProfilePage={setProfilePage}
					setProfileDisplayed={setProfileDisplayed}
					SetHistoryList={SetHistoryList}/>
                  <p> Current username : {User.username} </p>
                  <form onSubmit={ChangeUsername}>
                    <p>
                      New Username : &nbsp;
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        minLength={1}
                        maxLength={16}
                        onChange={(e) => setChangename(e.target.value)}
                      />
                      <button type="submit">Submit</button>
                    </p>
                  </form>
                  <p>
                    Current Avatar :
                    <img
                      src={User.image}
                      alt="user_img"
                      width="96"
                      height="64"
                    />
                    <br></br>
                  </p>
                  <form onSubmit={ChangeAvatar}>
                    <p>
                      New Avatar : &nbsp;
                      <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        required
                        onChange={(e) =>
                          e.target.files != null
                            ? setChangeavatar(e.target.files[0])
                            : ""
                        }
                      />
                      <button type="submit">Submit</button>
                    </p>
                  </form>
                  <div>
                    {!IsTwoAuthActivated && !QrCode ? (
                      <div>
                        <button onClick={(e) => GetQrCode(e)}>
                          Activate two auth login{" "}
                        </button>
                        <br></br>
                      </div>
                    ) : (
                      <p></p>
                    )}
                  </div>
                  <div>
                    {!IsTwoAuthActivated ? (
                      QrCode ? (
                        <div>
                          <img src={URL.createObjectURL(QrCode)} alt="QrCode" />
                          <br></br>
                          <form onSubmit={ActivateTwoAuth}>
                            <p>
                              {" "}
                              Please enter your 6 digit code after scanning the
                              QRCODE in the Google Authenticator app : &nbsp;
                              <input
                                type="text"
                                id="code"
                                name="code"
                                required
                                onChange={(e) => setAuthCode(e.target.value)}
                              />
                              <button type="submit">Submit</button>
                            </p>
                          </form>
                        </div>
                      ) : (
                        <p></p>
                      )
                    ) : (
                      <div>
                        <button onClick={setOfAuthStatus}>
                          {" "}
                          Desactivate two auth{" "}
                        </button>
                        <br></br>
                        <div>
                          <div>
                            {TurnedOff ? (
                              <div>
                                <form onSubmit={DeactivatedTwoAuth}>
                                  <p>
                                    {" "}
                                    Please enter your 6 digit code to deactivate
                                    two auth authentication : &nbsp;
                                    <input
                                      type="text"
                                      id="code"
                                      name="code"
                                      required
                                      onChange={(e) =>
                                        setAuthCode(e.target.value)
                                      }
                                    />
                                    <button type="submit">Submit</button>
                                  </p>
                                </form>
                              </div>
                            ) : (
                              <p></p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => navigate("/")}> Home </button>
                </div>
              ) : (
                <div>
                  <button onClick={() => navigate("/")}> Home </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <button onClick={() => navigate("/")}> Home </button>
            </div>
          )}
        </div>
      ) : (
        <p> Loading .... </p>
      )}
    </div>
  );
}

export default Settings;
