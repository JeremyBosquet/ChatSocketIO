import React, { useEffect, useState } from 'react';

import { IoArrowBackOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import KillSocket from '../../Components/KillSocket/KillSocket';
import NavBar from '../../Components/Nav/NavBar';
import { createNotification } from '../../Components/notif/Notif';
import Popup from '../../Components/Popup/Popup';
import DM from '../../Components/PrivateMessages/DM/DM';
import PrivateMessages from '../../Components/PrivateMessages/PrivateMessages';
import { getLogged, getUser, setLogged, setUser } from '../../Redux/authSlice';
import { getDMs, getMode, setDMs } from '../../Redux/chatSlice';
import './DMPage.scss'
import instance from '../../API/Instance';

function DMPage() {
	const logged = useSelector(getLogged);
    const user = useSelector(getUser);
    const dispatch = useDispatch();
	const navigate = useNavigate();
	const params = useParams();
    const [init, setInit] = useState<boolean>(false);
	const dms : [] = useSelector(getDMs);

	KillSocket("spectate");
	KillSocket("game");
    
    useEffect(() => {
        const getUsersDM = async (userId: any) => {
            await instance.get(`chat/dm/user`)
            .then((res) => {
                if (res)
                    dispatch(setDMs(res.data));
                    setInit(true);
            })
        }
        
        if (!init)
            getUsersDM(user.uuid);
        //eslint-disable-next-line
    }, [])

	useEffect(() => {
		const getUserInfos = async () => {
			await instance.get(`user`)
			.then((res) => {
				dispatch(setUser(res.data.User));
				dispatch(setLogged(true));
			})
			.catch(() => {
			  createNotification("error", "User not found");
			  navigate("/");
			});
		}

		if (localStorage.getItem("token"))
			getUserInfos();
	}, []);

	const handleChangeMode = (newMode: string) => {
		if (newMode === "channels")
			navigate("/chat/channel")
		if (newMode === "dm")
			return ;
	}
	return (
		<>
		<div className="blur">
			<NavBar/>
			<div className='chatPage'>
				<div className='container'>
						
					{logged === false ?
						<div className='notLogged'>
							<p>Pending...</p>
						</div>
					:
					<>
						{params.id ?
							(
								<div className="backButtonDiv">
									<button className="backButton" onClick={() => navigate('/chat/')}><IoArrowBackOutline className='backIcon'/> Back</button>
								</div>
							) : null
						}
						<div className={params.id ? 'leftSide hideSmall' : 'leftSide'}>
							<div className='topActions'>
								<div className='selectChannelOrDm'>
									<button className="selectedButton" onClick={() => handleChangeMode("channels")}>Channels</button>
									<button className="selectedButton" onClick={() => handleChangeMode("dm")}>DM</button>
								</div>
							</div>
							<div className='channelsInfos'>
								<div className='channelsInfo dmWidthChange'>
									{dms && dms.map((channel : any) => (
										<DM key={channel["id"]} dm={channel} />
									))}
								</div>
							</div>
						</div>
						<PrivateMessages />
					</>
				}
				</div>
			</div>
		</div>
		<Popup User={user} />
		</>
	);
}

export default DMPage;
