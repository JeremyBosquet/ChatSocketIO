
import axios from "axios";
import React from "react";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import instance from "../../API/Instance";
import { setUser } from "../../Redux/authSlice";
// import { getLogged, getUser, setLogged, setUser, getActivated, setActivated, getConnected, setConnected } from '../../Redux/authSlice';
import { createNotification } from "../notif/Notif";

function GetToken() {
  let navigate = useNavigate();
  let booleffect = false;
  // let booleffect2 = true;
  const booleffect2 = useRef<boolean>(true);
  const firstrender = useRef<boolean>(true);

  const [IsTwoAuthActivated, setActivated] = useState<boolean>(false);
  const [IsTwoAuthConnected, setConnected] = useState<boolean>();
  const [booleffect3, setBooleffect3] = useState<boolean>(false);

  const dispatch = useDispatch();

  async function GetLoggedInfo() {
    if (localStorage.getItem("token")) {
      await instance.get(`user/getLoggedInfo`)
        .then((res) => {
			console.log("1", res.data.isTwoFactorAuthenticationEnabled)
			console.log("2", res.data.isSecondFactorAuthenticated)
          setActivated(res.data.isTwoFactorAuthenticationEnabled);
          setConnected(res.data.isSecondFactorAuthenticated);
		  setBooleffect3(true);
        })
        .catch((err) => {
          console.log(err.message);
		  setBooleffect3(true);
        });
    }
  }
  function redirect() {
    if (IsTwoAuthActivated)
		navigate("/twoauth");
  }

  async function NotActivated() {
    console.log("Bearer " + localStorage.getItem("token"));
    await instance.get(`user`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((res) => {
        dispatch(setUser(res.data.User));
        console.log(res.data.message);
        createNotification("success", "User connected");
        navigate("/");
      })
      .catch((err) => {
        console.log(err.message);
        createNotification("error", "failed to connect");
        navigate("/");
      });
  }
  function AuthCall(): any {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");
    console.log(code);
    instance.get(`login/42/return/` + code)
      .then((res) => {
        if (res.data) {
          localStorage.setItem("token", res.data.token);
		  console.log("token", res.data.token);
          GetLoggedInfo();
          //console.log("heho " + IsTwoAuthActivated);
          // if (IsTwoAuthActivated)
          // 	navigate("/twoauth")
        }
      })
      .catch((err) => {
        console.log(err.message);
        navigate("/");
      });
    // if (!IsTwoAuthActivated)
    // {
    // 	console.log('Bearer ' + localStorage.getItem('token'));
    // 	await instance.get(`user`, {
    // 		headers: ({
    // 			Authorization: 'Bearer ' + localStorage.getItem('token'),
    // 		})
    // 	}).then((res) => {
    // 		setUser(JSON.stringify(res.data.User));
    // 		console.log(res.data.message)
    // 		navigate("/")
    // 	}).catch((err) => {
    // 		console.log(err.message);
    // 	});
    // }
  }
  useEffect(() => {
    if (!booleffect) {
      //GetLoggedInfo();
      AuthCall();
      booleffect = true;
    }
  }, []);
  useEffect(() => {
    if (firstrender.current) {
		console.log("first render");
      firstrender.current = false;
      return;
    }
    if (booleffect3) {
		if (IsTwoAuthActivated)
			redirect();
		else
			NotActivated();
    }
  }, [IsTwoAuthActivated, booleffect3]);
  return (
    <div>
      <p> Login in process ...</p>
    </div>
  );
}

export default GetToken;
