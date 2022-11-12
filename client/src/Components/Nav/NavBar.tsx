import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import {
  redirect,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { createNotification } from "../notif/Notif";
import { FaUserCircle, FaUserFriends } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { IoLogOutSharp } from "react-icons/io5";
import { IoGameController } from "react-icons/io5";
import { BsFillEyeFill } from "react-icons/bs";
import { GrClose } from "react-icons/gr";
import {AiOutlineClose} from "react-icons/ai";
import "./NavBar.scss";
import Social from "../../Pages/Social/Social";

function NavBar(props: any) {
  let navigate = useNavigate();
  let location = useLocation();
  let booleffect = false;
  let tab: any[] = [];
  const [compt, setCompt] = useState<number>(0);
  const [booleffect2, setbooleffect2] = useState<boolean>(true);

  const [User, setUser] = useState<any>();
  const [IsLoggedIn, setLogged] = useState<boolean>();
  const [IsTwoAuthActivated, setActivated] = useState<boolean>();
  const [IsTwoAuthConnected, setConnected] = useState<boolean>();
  const [friendRequest, setFriendRequest] = useState<number>();

  const [checkedProfile, setCheckedProfile] = useState<boolean>(false);
  const [checkedSettings, setCheckedSettings] = useState<boolean>(false);
  const [checkedLogout, setCheckedLogout] = useState<boolean>(false);
  const [checkedGame, setCheckedGame] = useState<boolean>(false);
  const [checkedSpectate, setCheckedSpectate] = useState<boolean>(false);
  const [checkedSocial, setCheckedSocial] = useState<boolean>(false);

  async function GetLoggedInfo() {
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
        })
        .catch((err) => {
          console.log(err.message);
          setLogged(false);
        });
      await axios
        .get(`http://90.66.192.148:7000/user/ListFriendRequest`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((res) => {
          tab = res.data.ListFriendsRequest;
          if (tab.length) {
            setFriendRequest(tab.length);
          } else setFriendRequest(0);
          setCompt(tab.length);
        })
        .catch((err) => {
          console.log(err.message);
          setFriendRequest(0);
        });
    }
    setbooleffect2(false);
  }

  function closeSocket() {
    if (props?.socket) {
      props.socket.disconnect();
      if (props?.setSocket) props.setSocket(undefined);
    }
  }

  function activeorDisable(nb: number) {
    switch (nb) {
      case 0:
        if (checkedProfile) setCheckedProfile(false);
        else {
          setCheckedSettings(false);
          setCheckedLogout(false);
          setCheckedGame(false);
          setCheckedSpectate(false);
          setCheckedSocial(false);
          setCheckedProfile(true);
        }
        navigate("/profile");
        break;
      case 1:
        if (checkedSettings) setCheckedSettings(false);
        else {
          setCheckedLogout(false);
          setCheckedGame(false);
          setCheckedSpectate(false);
          setCheckedSocial(false);
          setCheckedProfile(false);
          setCheckedSettings(true);
        }
        navigate("/settings");
        break;
      case 2:
        if (checkedLogout) setCheckedLogout(false);
        else {
          setCheckedSettings(false);
          setCheckedGame(false);
          setCheckedSpectate(false);
          setCheckedSocial(false);
          setCheckedProfile(false);
          setCheckedLogout(true);
        }
        navigate("/logout");
        break;
      case 3:
        if (checkedGame) setCheckedGame(false);
        else {
          setCheckedSettings(false);
          setCheckedLogout(false);
          setCheckedSpectate(false);
          setCheckedSocial(false);
          setCheckedProfile(false);
          setCheckedGame(true);
        }
        navigate("/game");
        break;
      case 4:
        if (checkedSpectate) setCheckedSpectate(false);
        else {
          setCheckedSettings(false);
          setCheckedLogout(false);
          setCheckedGame(false);
          setCheckedSocial(false);
          setCheckedProfile(false);
          setCheckedSpectate(true);
        }
        navigate("/game/spectate");
        break;
      case 5:
        if (checkedSocial) {
          setCheckedSocial(false);
          closeNav();
        } else {
          setCheckedSettings(false);
          setCheckedLogout(false);
          setCheckedGame(false);
          setCheckedSpectate(false);
          setCheckedProfile(false);
          setCheckedSocial(true);
          openNav();
        }
        //navigate("/social");
        break;
      default:
        break;
    }
  }

  /* Set the width of the side navigation to 250px */
  function openNav() {
    const open = document.getElementById("mySidenav");
    open?.classList.toggle("active");
	const reveal = document.getElementById("navButtons");
	reveal?.classList.toggle("hidden");
  }

  /* Set the width of the side navigation to 0 */
  function closeNav() {
    const close = document.getElementById("mySidenav");
    close?.classList.toggle("active");
	const hide = document.getElementById("navButtons");
	hide?.classList.toggle("hidden");
  }

  useEffect(() => {
    if (!booleffect) {
      GetLoggedInfo();
      // CallLogout()
      booleffect = true;
    }
  }, []);
  return (
    <div className="NavBar">
      {!booleffect2 ? (
        <div>
          {
            <div>
              <div className="menu">
                <div id='ProjectName'>
                  <button
                    onClick={() => {
                      closeSocket();
                      navigate("/");
                    }}>
                    Ft_transcendance
                  </button>
                </div>
                <div id="navButtons">
                  <div id="profile" className="click">
                    <label className="icon">
                      <input
                        type="radio"
                        id="Profile"
                        value="Profile"
                        name="menu_text"
                        onChange={() => {}}
                        onClick={() => {
                          closeSocket();
                          activeorDisable(0);
                        }}
                        checked={checkedProfile}
                      />
					  <span className="span">
                        <FaUserCircle />
                      </span>
                    </label>
                  </div>
                  <div id="settings" className="click">
                    <label className="icon">
                      <input
                        type="radio"
                        id="Settings"
                        value="Settings"
                        name="menu_text"
                        onChange={() => {}}
                        onClick={() => {
                          closeSocket();
                          activeorDisable(1);
                        }}
                        checked={checkedSettings}
                      />
                      <span className="span">
                        <IoMdSettings />
                      </span>
                    </label>
                  </div>
                  <div id="logout" className="click">
                    <label className="icon">
                      <input
                        type="radio"
                        id="Logout"
                        value="Logout"
                        name="menu_text"
                        onChange={() => {}}
                        onClick={() => {
                          closeSocket();
                          activeorDisable(2);
                        }}
                        checked={checkedLogout}
                      />
                      <span className="span">
                        <IoLogOutSharp />
                      </span>
                    </label>
                  </div>
                  <div id="game" className="click">
                    <label className="icon">
                      <input
                        type="radio"
                        id="Game"
                        value="Game"
                        name="menu_text"
                        onChange={() => {}}
                        onClick={() => {
                          closeSocket();
                          activeorDisable(3);
                        }}
                        checked={checkedGame}
                      />
                      <span className="span">
                        <IoGameController />
                      </span>
                    </label>
                  </div>
                  <div id="spectate" className="click">
                    <label className="icon">
                      <input
                        type="radio"
                        id="Spectate"
                        value="Spectate"
                        name="menu_text"
                        onChange={() => {}}
                        onClick={() => {
                          closeSocket();
                          activeorDisable(4);
                        }}
                        checked={checkedSpectate}
                      />
                      <span className="span">
                        <BsFillEyeFill />
                      </span>
                    </label>
                  </div>
                <div>
                  {friendRequest ? (
                    <div id="social" className="click">
                      <label className="icon">
                        <input
                          type="radio"
                          id="Social"
                          value="Social"
                          name="menu_text"
                          onChange={() => {}}
                          onClick={() => {
                            activeorDisable(5);
                          }}
                          checked={checkedSocial}
                        />
                        <span className="span">
                          <FaUserFriends />
                        </span>
                      </label>
                      {/* <button id='menu_text' onClick={() => {
											socket?.disconnect();
											setSocket(undefined);
											navigate("/social")
										}}> Social({compt}) </button> */}
                    </div>
                  ) : (
                    <div id="social" className="click">
                      <label className="icon">
                        <input
                          type="radio"
                          id="Social"
                          value="Social"
                          name="menu_text"
                          onChange={() => {}}
                          onClick={() => {
                            activeorDisable(5);
                          }}
                          checked={checkedSocial}
                        />
                        <span className="span">
                          <FaUserFriends />
                        </span>
                      </label>
                      {/* <button id='menu_text' onClick={() => {
										socket?.disconnect();
										setSocket(undefined);
										navigate("/social")
									}}> Social </button> */}
                    </div>
                  )}
				  </div>
				  </div>
                  <div id="mySidenav" className="sidenav">
                    <button className="closebtn" onClick={() => closeNav()}>
                      <span>
                        <AiOutlineClose />
                      </span>
                    </button>
                    {/* <a href="/">About</a>
                    <a href="#">Services</a>
                    <a href="#">Clients</a>
                    <a href="#">Contact</a> */}
					<Social/>
                  </div>
              </div>
            </div>
          }
        </div>
      ) : null}
    </div>
  );
}

export default NavBar;
