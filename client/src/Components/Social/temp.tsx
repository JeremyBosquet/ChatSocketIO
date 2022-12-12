import React from "react"
	// async function ShowProfileUseEffect(uuid : string)
	// {
	// 	await axios.get(`http://90.66.199.176:7000/api/room/getGameOfUser/` + uuid, {
	// 	headers: ({
	// 		Authorization: 'Bearer ' + token,
	// 	})
	// 	}).then((res) => {
	// 		if (res.data && res.data.length)
	// 			dispatch(setHistoryList(res.data));
	// 		else if (res.data)
	// 			dispatch(setHistoryList([]));
	// 	});
	// 	await axios.get(`http://90.66.199.176:7000/user/findUser/` + uuid, {
	// 	headers: ({
	// 		Authorization: 'Bearer ' + token,
	// 	})
	// 	}).then((res) => {
	// 		if (res && res.data)
	// 		{
	// 			dispatch(setProfilePage(res.data.User));
	// 			dispatch(setProfileDisplayed(true));
	// 			let blur = document.getElementsByClassName('blur');
	// 			for (let i = 0; i < blur.length ; i++)
	// 				blur[i]?.classList.toggle('active');
	// 			let popup = document.getElementsByClassName('popup');
	// 			for (let i = 0; i < popup.length ; i++)
	// 				popup[i]?.classList.toggle('active');
	// 		}
	// 		else
	// 			dispatch(setProfilePage([]));
	// 	}).catch((err) => {
	// 		console.log(err);
	// 		navigate('/social');
	// 	});
	// }

	// async function HideProfileUseEffect()
	// {
	// 	dispatch(setProfileDisplayed(false));
	// 	let blur = document.getElementsByClassName('blur');
	// 	for (let i = 0; i < blur.length ; i++)
	// 		blur[i]?.classList.toggle('active');
	// 	let popup = document.getElementsByClassName('popup');
	// 	for (let i = 0; i < popup.length ; i++)
	// 		popup[i]?.classList.toggle('active');
	// }