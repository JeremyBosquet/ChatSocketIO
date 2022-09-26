import axios from 'axios';
import { useEffect, useState } from 'react';

interface IUser {

    id: number;
    username: string;
    image: string;
    createdAt: Date;
}

function HomePage() {
	const [user, setUser] = useState<IUser>();
	const GetUser = async () => {
		axios.defaults.withCredentials = true
		axios.get(`http://45.147.97.2:5000/users`, {withCredentials: true}).then(res => {
      console.log("success", res);
    }).catch(err => {
      console.log(err);
    })
		// console.log(user);
		// if (user?.data) {
		// 	setUser(user.data);
		//   }
	}
	useEffect(() => {
		GetUser()},[]
	);
	return (
		<div>
		<head>
			<title>Passport-42 Example</title>
			<link rel="stylesheet" href="/stylesheets/style.css" />
		</head>
		<body>
		{
			typeof user === 'undefined' ?
				<p>
				<a href="/">Home</a> |
				<a href="/login">Log In</a>
				</p>

			:

				<p>
				<a href="/">Home</a> | <a href="/profile">Profile</a> |
				<a href="/users">Users</a> | <a href="/logout">Log Out</a>
				</p>
		}
		</body>
		</div>
	)
}

export default HomePage;