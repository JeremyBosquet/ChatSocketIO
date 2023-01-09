
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { createNotification } from "../notif/Notif";
import React from "react";
import "./GameReady.scss";
import { ScaleLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import { getSockeGame } from "../../Redux/gameSlice";
import instance from "../../API/Instance";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { ImFileText2 } from "react-icons/im";
import { IConfiguration, IRoom } from "../GamePlay/Interfarces/GameInterace";

interface props {
	socket: Socket | undefined;
	setReady: (ready: boolean) => void;
	setPlayerId: (playerId: string) => void;
	setPlayerName: (playerName: string) => void;
	setDisplay: (display: boolean) => void;
}

function GameReady(props: props) {
	const [searching, setSearching] = useState<boolean>(false);
	const [searchingDisplay, setSearchingDisplay] = useState<boolean>(false);
	const [room, setRoom] = useState<IRoom>();
	const [tmpUser, setTmpUser] = useState<any>(null);
	const [tmpUserBoolean, setTmpUserBoolean] = useState<boolean>(false);
	const [configuringDisplay, setConfiguringDisplay] = useState<boolean>(false);
	const [settings, setSettings] = useState<IConfiguration>({ difficulty: "easy", background: "basic", confirmed: false });
	const [settingsBis, setSettingsBis] = useState<IConfiguration>({ difficulty: "easy", background: "basic", confirmed: false });
	const socket = useSelector(getSockeGame);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	useEffect(() => {
		if (searching && !tmpUserBoolean) {
			setTmpUserBoolean(true);
			socket?.on("searching-" + tmpUser.id, (data: IRoom) => {
				setSearchingDisplay(true);
				setRoom(data);
			});
			socket?.emit("searching", tmpUser);
		}
	}, [searching, tmpUser, tmpUserBoolean, socket]);
	const [timeouts, setTimeouts] = useState<number>(20);
	socket?.removeListener("configuring");
	socket?.removeListener("configurationUpdated");
	socket?.removeListener("playerLeave");
	socket?.removeListener("roomDestroyed");
	socket?.removeListener("roomTimeout");

	socket?.on("configuring", (data: IRoom) => {
		setSettingsBis({ difficulty: "easy", background: "basic", confirmed: false });
		setSettings({ difficulty: "easy", background: "basic", confirmed: false });
		setSearchingDisplay(false);
		setConfiguringDisplay(true);
	});
	socket?.on("roomDestroyed", (data: any) => {
		createNotification("info", "One of the players hasn't confirmed the configuration");
		socket?.emit("cancelSearching", { tmpUser, room });
		setSearchingDisplay(false);
		setSearching(false);
		setTmpUserBoolean(false);
		setConfiguringDisplay(false);
		setSettings({ difficulty: "easy", background: "basic", confirmed: false });
		props.setDisplay(true);
	});
	socket?.on("roomTimeout", (data: any) => {
		setTimeouts(data.time);
	});
	socket?.on("configurationUpdated", (data: IRoom) => {
		if (data.playerA?.id === tmpUser?.id) setSettingsBis(data.configurationB);
		else setSettingsBis(data.configurationA);
	});
	socket?.on("playerLeave", () => {
		createNotification("info", "The other player left the room");
		setSearchingDisplay(true);
		setSearching(true);
		setTmpUserBoolean(true);
		setConfiguringDisplay(false);
		setSettings({ difficulty: "easy", background: "basic", confirmed: false });
	});

	const getUser = async () => {
		const messages = await instance.get(`user`, {
			headers: {
				Authorization: "Bearer " + localStorage.getItem("token"),
			},
		});
		if (messages?.data && messages.data?.User) {
			setTmpUser({
				id: messages.data.User.uuid,
				name: messages.data.User.username,
			});
		}
	};
	useEffect(() => {
		getUser();
	}, []);
	async function handleReady() {
		await instance.get(`user`)
		.then(() => {
			props.setPlayerId(tmpUser.id);
			props.setPlayerName(tmpUser.name);
			setSearching(true);
			props.setDisplay(false);
		})
		.catch(() => {
			window.location.reload();
		});
	}
	return (
		<>
			{!searchingDisplay && !configuringDisplay ? (
				<div className="buttonAndRules">
					<button onClick={handleReady} className="play-button">
						Search for a game
					</button>
					<Link className="rules" to="/rules"><ImFileText2 /></Link>
				</div>
			) : null}
			{
				searchingDisplay || configuringDisplay
					? (
						<div className="PlayInterface">
							{searchingDisplay ? (
								<div>
									<Helmet>
										<meta charSet="utf-8" />
										<title> Searching - transcendence </title>
										<link rel="icon" type="image/png" href="/logo.png" />
									</Helmet>
									<ScaleLoader
										className="loading-spinner"
										color={"#FFFFFF"}
										loading={true}
										height={65}
										speedMultiplier={0.75}
										width={10}
									/>
									{
										//<p className="waiting-text">Searching for a game...</p>
									}
									<button
										onClick={
											() => {
												socket?.emit("cancelSearching", { tmpUser, room });
												setSearchingDisplay(false);
												setConfiguringDisplay(false);
												setSearching(false);
												setTmpUserBoolean(false);
												props.setDisplay(true);
											}
										}
										className="cancel-button"
									>
										Cancel
									</button>
								</div>
							) : null}
							{configuringDisplay ? (
								<>
									<Helmet>
										<meta charSet="utf-8" />
										<title> Configuring - transcendence </title>
										<link rel="icon" type="image/png" href="/logo.png" />
									</Helmet>
									<div className="game-config">
										<p>Configuring the game...</p>
										<p>{timeouts}</p>
										<div className="ChannelRoomFormInput-Difficulty">
											<label htmlFor="Difficulty">Difficulty </label>
											<select
												disabled={settings?.confirmed}
												className="game-config-select"
												defaultValue="easy"
												id="Difficulty"
												onChange={(e) => {
													if (e.target.value === "undefined") return;
													if (settings)
														setSettings({ ...settings, difficulty: e.target.value });
													else
														setSettings({
															difficulty: e.target.value,
															background: "",
															confirmed: false,
														});
													socket?.emit("updateConfirugation", {
														difficulty: e.target.value,
														background: settings?.background,
														confirmed: false,
													});
												}}
											>
												<option key="easy" value="easy">
													Easy
												</option>
												<option key="medium" value="medium">
													Medium
												</option>
												<option key="hard" value="hard">
													Hard
												</option>
											</select>
										</div>
										<div className="ChannelRoomFormInput-Background">
											<label htmlFor="Background">Background </label>
											<select
												disabled={settings?.confirmed}
												className="game-config-select"
												defaultValue="basic"
												id="Background"
												onChange={(e) => {
													if (e.target.value === "undefined") return;
													if (settings)
														setSettings({ ...settings, background: e.target.value });
													else
														setSettings({
															difficulty: "",
															background: e.target.value,
															confirmed: false,
														});
													socket?.emit("updateConfirugation", {
														difficulty: settings?.difficulty,
														background: e.target.value,
														confirmed: false,
													});
												}}
											>
												<option key="basic" value="basic">
													basic
												</option>
												<option key="inverted" value="inverted">
													inverted
												</option>
											</select>
										</div>
										<div>
											<button
												className="game-config-button"
												onClick={
													() => {
														socket?.emit("cancelSearching", { tmpUser, room });
														setSearchingDisplay(false);
														setSearching(false);
														setTmpUserBoolean(false);
														setConfiguringDisplay(false);
														setSettings({ difficulty: "easy", background: "basic", confirmed: false });
														props.setDisplay(true);
													}
												}
											>
												Cancel
											</button>
											{!settings?.confirmed ? (
												<button
													className="game-config-button"
													onClick={
														() => {
															if (
																settings?.difficulty &&
																settings?.background &&
																settings?.confirmed === false
															) {
																setSettings({ ...settings, confirmed: true });
																socket?.emit("confirmConfiguration", settings);
															}
														}
													}
												>
													Ready
												</button>
											) : null}
										</div>
									</div>
									<div className="game-config-secondary">
										<p>Configuration of the other player</p>
										<div className="line"></div>
										<div className="ChannelRoomFormInput-Difficulty">
											<label htmlFor="Difficulty">Difficulty :&nbsp;</label>
											{settingsBis?.difficulty ? (
												<p>{settingsBis.difficulty}</p>
											) : (
												<p>easy</p>
											)}
										</div>
										<div className="line"></div>
										<div className="ChannelRoomFormInput-Background">
											<label htmlFor="Difficulty">Background :&nbsp;</label>
											{settingsBis?.background ? (
												<p>{settingsBis.background}</p>
											) : (
												<p>basic</p>
											)}
										</div>
										<div className="line"></div>
										<div className="ChannelRoomFormInput-Status">
											Ready :&nbsp;{settingsBis?.confirmed ? <p>Yes</p> : <p>No</p>}
										</div>
									</div>
								</>
							) : null}
						</div>
					) : null
			}
		</>
	);
}

export default GameReady;
