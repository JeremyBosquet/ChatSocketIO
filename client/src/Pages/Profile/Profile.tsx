import axios from "axios";
import { useEffect, useRef, useState } from "react";
import SignIn from "../../Components/Auth/Signin";
import { redirect, useNavigate, useLocation } from "react-router-dom";
import { createNotification } from "../../Components/notif/Notif";
import { whoWon } from "../../Components/Utils/whoWon";
import React from "react";

import "./Profile.scss";
import NavBar from "../../Components/Nav/NavBar";
// import { useDispatch, useSelector } from 'react-redux';
// import { getLogged, getUser, setLogged, setUser, getActivated, setActivated, getConnected, setConnected } from '../Redux/authSlice';

function Profile() {
  let navigate = useNavigate();
  let booleffect = false;
  const token = localStorage.getItem("token");

  const [booleffect2, setbooleffect2] = useState<boolean>(true);
  const [historyList, SetHistoryList] = useState<any[]>([]);
  const firstrender = useRef<boolean>(true);

  // const IsTwoAuthConnected = useSelector(getConnected);
  // const IsTwoAuthActivated = useSelector(getActivated);
  // const IsLoggedIn = useSelector(getLogged);
  // const User = useSelector(getUser);
  // const dispatch = useDispatch();

  const [User, setUser] = useState<any>();
  const [IsLoggedIn, setLogged] = useState<boolean>();
  const [IsTwoAuthActivated, setActivated] = useState<boolean>();
  const [IsTwoAuthConnected, setConnected] = useState<boolean>();

  function goHome() {
    navigate("/");
  }

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
        })
        .catch((err) => {
          console.log(err.message);
        });

      await axios
        .get(`http://90.66.192.148:7000/user`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((res) => {
          setUser(res.data.User);
          axios
            .get(
              `http://90.66.192.148:7000/api/room/getGameOfUser/` +
                res.data.User.uuid,
              {
                headers: {
                  Authorization: "Bearer " + token,
                },
              }
            )
            .then((res) => {
              if (res.data && res.data.length) SetHistoryList(res.data);
              else if (res.data) SetHistoryList([]);
            });
          console.log(res.data.User);
        })
        .catch((err) => {
          console.log(err);
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
  useEffect((): any => {
    if (!booleffect) {
      GetLoggedInfoAndUser();
      booleffect = true;
    }
  }, []);

  return (
    <div className="profilePage">
      <div className="container">
        {
          <>
            <NavBar />
            <>
              {!booleffect2 ? (
                <>
                  {User ? (
                    <div className="userProfile">
                      {
                        <div>
                          <h1> Hello {User?.username} </h1>
                          <img
                            src={User?.image}
                            alt="user_img"
                            width="384"
                            height="256"
                          />
                          <br></br>
                          <div id="listParent">
                            {historyList.length ? (
                              <div id="list">
                                {historyList.map((game, index) => (
                                  <ul key={index}>
                                    {whoWon(User.uuid,game.playerA,game.playerB,game.status) === "Victory" ? (
                                      <li>
                                        <span className="green">
                                          {game.playerA.name} vs {game.playerB.name} / {whoWon(User.uuid,game.playerA,game.playerB,game.status)}
                                        </span>
                                      </li>
                                    ) : (
                                      <li>
                                        <span className="red">
                                          {game.playerA.name} vs {game.playerB.name} / {whoWon(User.uuid,game.playerA,game.playerB, game.status)}
                                        </span>
                                      </li>
                                    )}
                                  </ul>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <button onClick={() => navigate("/")}> Home </button>
                          <button onClick={() => navigate("/logout")}>
                            {" "}
                            Logout{" "}
                          </button>
                        </div>
                      }
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          </>
        }
      </div>
    </div>
  );
}

export default Profile;
