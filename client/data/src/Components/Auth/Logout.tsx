import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  redirect,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { getSocketSocial } from "../../Redux/authSlice";
import { createNotification } from "../notif/Notif";

function Logout() {
  let navigate = useNavigate();
  let location = useLocation();
  let booleffect = false;

  const socketSocial = useSelector(getSocketSocial);

  async function GetLoggedInfo() {
    await axios.get(`http://192.168.1.53:7000/user`, {
		headers: {
			Authorization: "Bearer " + localStorage.getItem("token"),
		},
	})
	.then((res) => {
		if (res.data.User)
			socketSocial?.emit("logout", res.data.User.uuid);
	}).catch(() => {
	})
  }

  async function CallLogout() {
    await axios
      .get(`http://192.168.1.53:7000/logout`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((res) => {
        GetLoggedInfo();
        localStorage.clear();
        createNotification("success", "User disconnected");
        navigate("/");
      })
      .catch((err) => {
        createNotification("error", "couldn't disconnect user");
        navigate("/");
      });
  }
  useEffect(() => {
    if (!booleffect) {
      CallLogout();
      booleffect = true;
    }
  }, []);
  return null;
}

export default Logout;
