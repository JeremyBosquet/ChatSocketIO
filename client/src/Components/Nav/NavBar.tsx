import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import {
  redirect,
  useNavigate,
  useLocation,
  useParams,
  NavLink,
} from "react-router-dom";
import { createNotification } from "../notif/Notif";
import { FaUserCircle, FaUserFriends } from "react-icons/fa";
import { IoMdChatbubbles, IoMdSettings } from "react-icons/io";
import { IoLogOutSharp } from "react-icons/io5";
import { IoGameController } from "react-icons/io5";
import { BsFillEyeFill } from "react-icons/bs";
import { GrClose } from "react-icons/gr";
import {AiOutlineClose} from "react-icons/ai";
import "./NavBar.scss";
import Social from "../Social/Social";

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

  /* Set the width of the side navigation to 250px */
  function openNav() {
		const openOrClose = document.getElementById("mySidenav");
		openOrClose?.classList.toggle("active");
		const revealOrHide = document.getElementById("navButtons");
		revealOrHide?.classList.toggle("hidden");
  }

  useEffect(() => {
    if (!booleffect) {
      GetLoggedInfo();
      // CallLogout()
      booleffect = true;
    }
  }, []);

  const handleClickNav = (pathname: string) => {
    if (location.pathname !== pathname)
      closeSocket();
  }

  return (
    <div className="NavBar">
            <div id='ProjectName'>
              <NavLink to="/" id='home'>
                Ft_transcendance
              </NavLink>
			</div>
        <>
            <div id="navButtons">
			<NavLink to="/chat" id="chat" className="click">
                <IoMdChatbubbles className="icon" />
            </NavLink>
			
			<>
                {friendRequest ? (
                  <button id="social" className="click" onClick={() => {openNav()}}>
                        <FaUserFriends className="icon"/>
                    {/* <button id='menu_text' onClick={() => {
                    socket?.disconnect();
                    setSocket(undefined);
                    navigate("/social")
                  }}> Social({compt}) </button> */}
                  </button>
                ) : (
                  <button id="social" className="click" onClick={() => {openNav()}}>
                        <FaUserFriends className="icon"/>
                    {/* <button id='menu_text' onClick={() => {
                  socket?.disconnect();
                  setSocket(undefined);
                  navigate("/social")
                }}> Social </button> */}
                  </button>
                )}
              </>

              <NavLink to="/game" id="game" className="click" onClick={() => handleClickNav("/game")}>
                <IoGameController className="icon"/>
              </NavLink>
              
              <NavLink to="/game/spectate" id="spectate" className="click" onClick={() => handleClickNav("/game/spectate")}>
                <BsFillEyeFill className="icon"/>
              </NavLink>

			  <NavLink to="/settings" id="settings" className="click">
                <IoMdSettings className="icon"/>
              </NavLink>

              <NavLink to="/logout" id="logout" className="click">
                <IoLogOutSharp className="icon"/>
              </NavLink>
            </div>
            <div id="mySidenav" className="sidenav">
              <button className="closebtn" onClick={() => openNav()}>
                <span>
                <AiOutlineClose />
                </span>
              </button>
              <Social
			  socket={props?.socket}
				setSocket={props?.setSocket}
				friendList={props?.friendList}
				SetFriendList={props?.SetFriendList}
				blockList={props?.blockList}
				SetBlockList={props?.SetBlockList}
				requestList={props?.requestList}
				SetRequestList={props?.SetRequestList}
				requestedList={props?.requestedList}
				SetRequestedList={props?.SetRequestedList}
				setProfilePage={props?.setProfilePage}
				setProfileDisplayed={props?.setProfileDisplayed}
				SetHistoryList={props?.SetHistoryList}
				setbooleffect3={props?.setbooleffect3}
				/>
            </div>
        </>
    </div>
  );
}

export default NavBar;
