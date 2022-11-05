import React from "react";
import { Navigate } from "react-router-dom";
const Protected = ({ isLoggedIn, children} : {isLoggedIn : any; children : any}) => {
 if (!isLoggedIn) {
 return <Navigate to="/" replace />;
 }
 return children;
};
export default Protected;