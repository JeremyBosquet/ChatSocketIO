import React from "react"

import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

interface props {
	trueUsername: string;
}

function Show(props: props) {

	return (
		<Link title="See profile" to={"/profile/" + props.trueUsername}><FaUserCircle /> </Link>
	);
}

export default Show;