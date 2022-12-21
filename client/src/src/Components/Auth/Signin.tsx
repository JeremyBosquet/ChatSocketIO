
import React from "react";
import { useEffect, useState } from "react";
import instance from "../../API/Instance";

function SignIn() {
  async function handleSubmit() {
    const { data } = await instance.get(`login`);
    window.location.assign(data);
  }
  useEffect(() => {
    handleSubmit();
  }, []);

  return <div></div>;
}

export default SignIn;
