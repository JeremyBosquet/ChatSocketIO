
import React from "react";
import { useEffect, useState } from "react";
import { redirect, useNavigate, useLocation } from "react-router-dom";
import instance from "../../API/Instance";

function SignIn() {
  let booleffect = false;

  async function handleSubmit() {
    const { data } = await instance.get(`login`);
    window.location.assign(data);
  }
  useEffect(() => {
    if (!booleffect) {
      handleSubmit();
      booleffect = true;
    }
  }, []);

  return <div></div>;
}

export default SignIn;
