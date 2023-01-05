import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import GameBoard from "../GameBoard/GameBoard";
import "./GamePlay.scss";
import useImage from 'use-image';
import useEventListener from "@use-it/event-listener";
import { Helmet } from "react-helmet";
import { useSelector } from "react-redux";
import { getSocketSocial } from "../../Redux/userSlice";

interface props {
	socket: Socket | undefined;
	room: IRoom | undefined;
	playerId: string;
	playerName: string;
}

interface IPlayer {
	id: string;
	name: string;
	status: string;
	x: number;
	y: number;
}

interface IRoom {
	id: string;
	name: string;
	nbPlayers: number;
	owner: string;
	status: string;
	createdAt: string;
	playerA: IPlayer;
	playerB: IPlayer;
	scoreA: number;
	scoreB: number;
	ball: IBall;
	settings: ISettings;
	configurationA: IConfiguration;
	configurationB: IConfiguration;
}

interface IConfiguration {
	difficulty: string;
	background: string;
}

interface ISettings {
	defaultSpeed: number;
	defaultDirection: number;
	boardWidth: number;
	boardHeight: number;
	ballRadius: number;
	background: string;
}

interface ICanvasBoard {
	x: number;
	y: number;
	id: string;
	percentY: number;
}

interface IBall {
	x: number;
	y: number;
	speed: number;
	direction: number;
}

interface ICanvasBall {
	x: number;
	y: number;
	id: string;
	radius: number;
	percentX: number;
	percentY: number;
}

let random = Math.random() * 1000;
random = Math.floor(random);
let lastTimestamp = 0;

function GamePlay(props: props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const contextRef = useRef<CanvasRenderingContext2D | null>(null);

	let boardAX = 0.025;
	let boardBX = 0.025;

	useEffect(() => {
		random = Math.random() * 1000;
		random = Math.floor(random);
	}, []);

	const [imageA] = (props.room?.playerA.name === props.playerName ? useImage(import.meta.env.VITE_URL_API + ":7000/api/user/getProfilePicture/" + props.room?.playerA.id + "#" + random) : useImage(import.meta.env.VITE_URL_API + ":7000/api/user/getProfilePicture/" + props.room?.playerA.id + "#" + random));
	const [imageB] = (props.room?.playerB.name === props.playerName ? useImage(import.meta.env.VITE_URL_API + ":7000/api/user/getProfilePicture/" + props.room?.playerB.id + "#" + random) : useImage(import.meta.env.VITE_URL_API + ":7000/api/user/getProfilePicture/" + props.room?.playerB.id + "#" + random));

	let mult = 0.5;
	if (window.innerWidth < 500)
		mult = 0.9;
	let _t = window.innerHeight * mult;
	let _r = (window.innerWidth * mult) / (window.innerHeight * mult);
	if (_r < 16 / 9) {
		_t = (window.innerWidth * mult) * (9 / 16);
	}
	const [windowsWidth, setWindowsWidth] = useState((16 * _t) / 9);
	const [windowsHeight, setWindowsHeight] = useState(_t);
	const [boardWidth, setBoardWidth] = useState<number>(
		props.room?.settings.boardWidth
			? (props.room?.settings.boardWidth / 100) * windowsWidth
			: 100
	);
	const [boardHeight, setBoardHeight] = useState<number>(
		props.room?.settings.boardHeight
			? (props.room?.settings.boardHeight / 100) * windowsHeight
			: 100
	);
	const [ball, setBall] = useState<ICanvasBall>({
		id: "ball",
		x: props.room?.ball.x
			? (props.room?.ball.x / 100) * windowsWidth
			: windowsWidth / 2,
		y: props.room?.ball.y
			? (props.room?.ball.y / 100) * windowsHeight
			: windowsHeight / 2,
		radius: props.room?.settings.ballRadius
			? (props.room?.settings.ballRadius / 100) * windowsHeight
			: 100,
		percentX: 50,
		percentY: 50,
	});
	const [playerA, setPlayerA] = useState<ICanvasBoard>({
		id: "playerA",
		x: boardAX * windowsWidth,
		y: props.room?.playerA.y
			? (props.room?.playerA.y / 100) * windowsHeight
			: windowsHeight / 2 - boardHeight / 2,
		percentY: 50,
	});
	const [playerB, setPlayerB] = useState<ICanvasBoard>({
		id: "playerB",
		x: (windowsWidth - boardBX * windowsWidth),
		y: props.room?.playerB.y
			? (props.room?.playerB.y / 100) * windowsHeight
			: windowsHeight / 2 - boardHeight / 2,
		percentY: 50,
	});

	const socketSocial = useSelector(getSocketSocial);
	useEffect(() => {
		socketSocial?.emit("joinGame");
		return () => {
			socketSocial?.emit("leaveGame");
		};
	}, [socketSocial]);

	function updateDisplay(): void {
		if (contextRef.current) {
			let primeColor;
			let secondColor;

			if (props.room?.settings.background === "inverted")
			{
				primeColor = "white";
				secondColor = "black";
			}
			else {
				primeColor = "black";
				secondColor = "white";
			}
			contextRef.current.clearRect(0, 0, windowsWidth, windowsHeight);
			contextRef.current.fillStyle = primeColor;
			contextRef.current.fillRect(0, 0, windowsWidth, windowsHeight);
			contextRef.current.fillStyle = secondColor;
			contextRef.current.fillRect(windowsWidth / 2 - 2, 0, 4, windowsHeight);
			contextRef.current.fillStyle = secondColor;

			let display = 50;
			if (window.innerWidth < 500) {
				display = 30;
				mult = 0.9;
				contextRef.current.font = "20px Arial";
				if (props.room?.scoreA)
					contextRef.current.fillText(props.room?.scoreA.toString(), windowsWidth / 2 - 35, 35);
				else
					contextRef.current.fillText("0", windowsWidth / 2 - 20, 25);
				if (props.room?.scoreB)
					contextRef.current.fillText(props.room?.scoreB.toString(), windowsWidth / 2 + 20, 35);
				else
					contextRef.current.fillText("0", windowsWidth / 2 + 10, 25);

			}
			else {
				mult = 0.5;
				contextRef.current.font = "30px Arial";
				if (imageA)
					contextRef.current.drawImage(imageA, windowsWidth / 2 - 100, 0, display, display);
				if (imageB)
					contextRef.current.drawImage(imageB, windowsWidth / 2 + 50, 0, display, display);
				if (props.room?.scoreA)
					contextRef.current.fillText(props.room?.scoreA.toString(), windowsWidth / 2 - 35, 35);
				else
					contextRef.current.fillText("0", windowsWidth / 2 - 35, 35);
				if (props.room?.scoreB)
					contextRef.current.fillText(props.room?.scoreB.toString(), windowsWidth / 2 + 20, 35);
				else
					contextRef.current.fillText("0", windowsWidth / 2 + 20, 35);
			}
			contextRef.current.fillStyle = secondColor;
			contextRef.current.fillRect(playerA.x, playerA.y, boardWidth, boardHeight);
			contextRef.current.fillStyle = secondColor;
			contextRef.current.fillRect(playerB.x, playerB.y, boardWidth, boardHeight);
			contextRef.current.beginPath();
			contextRef.current.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
			if (ball.x < windowsWidth / 2 + 2 && ball.x > windowsWidth / 2 - 2)
				contextRef.current.fillStyle = "gray";
			else
				contextRef.current.fillStyle = secondColor;

			contextRef.current.fill();
			contextRef.current.closePath();
		}
	}

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");
		if (context) {
			contextRef.current = context;
			updateDisplay();
		}
	}, []);

	const mousemove =
		(e: any) => {
			setBoardWidth(
				props.room?.settings.boardWidth
					? (props.room?.settings.boardWidth / 100) * windowsWidth
					: 100
			);
			setBoardHeight(
				props.room?.settings.boardHeight
					? (props.room?.settings.boardHeight / 100) * windowsHeight
					: 100
			);
			setBall({
				...ball,
				id: "ball",
				radius: props.room?.settings.ballRadius
					? (props.room?.settings.ballRadius / 100) * windowsHeight
					: 100,
				x: (ball.percentX / 100) * windowsWidth,
				y: (ball.percentY / 100) * windowsHeight,
				percentX: ball.percentX,
				percentY: ball.percentY,
			});
			const _player = { id: "", x: 0, y: 0 };
			if (props.room?.playerA.name === props.playerName) {
				_player.id = playerA.id;
				_player.x = playerA.x;
				_player.y = playerA.y;
			} else {
				_player.id = playerB.id;
				_player.x = playerB.x;
				_player.y = playerB.y;
			}
			if (!e?.clientY) return;
			const _height = e?.clientY;
			_player.y =
				(((_height - boardHeight / 2) * 100) / window.innerHeight) *
				(windowsHeight / 100);
			if (_player.y < 0) _player.y = 0;
			if (_player.y + boardHeight > windowsHeight)
				_player.y = windowsHeight - boardHeight;

			props.socket?.emit("playerMove", {
				id: _player.id,
				x: (100 * _player.x) / windowsWidth,
				y: (100 * _player.y) / windowsHeight,
				timestamp: Date.now(),
			});
			if (props.room?.playerA.name === props.playerName) {
				setPlayerA({ ...playerA, y: _player.y, percentY: ((100 * _player.y) / windowsHeight), x: boardAX * windowsWidth });
				setPlayerB({ ...playerB, x: (windowsWidth - boardBX * windowsWidth) });
			}
			else {
				setPlayerA({ ...playerA, x: boardAX * windowsWidth });
				setPlayerB({ ...playerB, y: _player.y, percentY: ((100 * _player.y) / windowsHeight), x: (windowsWidth - boardBX * windowsWidth) });
			}
			updateDisplay();
		}

	useEventListener("mousemove", mousemove);
	function handleResize() {
		let t = window.innerHeight * mult;
		let r = (window.innerWidth * mult) / (window.innerHeight * mult);
		if (r < 16 / 9) {
			t = (window.innerWidth * mult) * (9 / 16);
		}
		setWindowsHeight(t);
		setWindowsWidth((16 * t) / 9);
		setBoardWidth(
			props.room?.settings.boardWidth
				? (props.room?.settings.boardWidth / 100) * windowsWidth
				: 100
		);
		setBoardHeight(
			props.room?.settings.boardHeight
				? (props.room?.settings.boardHeight / 100) * windowsHeight
				: 100
		);
		setBall({
			...ball,
			id: "ball",
			radius: props.room?.settings.ballRadius
				? (props.room?.settings.ballRadius / 100) * windowsHeight
				: 100,
			x: (ball.percentX / 100) * windowsWidth,
			y: (ball.percentY / 100) * windowsHeight,
			percentX: ball.percentX,
			percentY: ball.percentY,
		});
		setPlayerA({
			...playerA,
			id: "playerA",
			x: (boardAX * windowsWidth),
			y: (playerA.percentY / 100) * windowsHeight,
			percentY: playerA.percentY,
		});
		setPlayerB({
			...playerB,
			id: "playerB",
			x: (windowsWidth - boardBX * windowsWidth),
			y: (playerB.percentY / 100) * windowsHeight,
			percentY: playerB.percentY,
		});
		updateDisplay();
	}
	useEventListener("resize", handleResize);

	props.socket?.removeListener("playerMovement");
	props.socket?.on("playerMovement", (data: any) => {
		if (data.player && data.x != undefined && data.y != undefined) {
			if (data.player === "playerA") {
				setPlayerA({
					...playerA,
					id: "playerA",
					x: boardAX * windowsWidth,
					y: (data.y / 100) * windowsHeight,
					percentY: data.y,
				});
			} else if ((data.player === "playerB")) {
				setPlayerB({
					...playerB,
					id: "playerB",
					x: windowsWidth - boardBX * windowsWidth,
					y: (data.y / 100) * windowsHeight,
					percentY: data.y,
				});
			}
		}
		updateDisplay();
	});
	props.socket?.removeListener("ballMovement");
	props.socket?.on("ballMovement", (data: any) => {
		if (lastTimestamp > data.timestamp) return;
		lastTimestamp = data.timestamp;
		setBall({
			...ball,
			id: "ball",
			x: (data?.x / 100) * windowsWidth,
			y: (data?.y / 100) * windowsHeight,
			percentX: data?.x,
			percentY: data?.y,
		});
		updateDisplay();
	});
	//console.log("render", canvasRef);
	//useEffect(() => {
	//	updateDisplay();
	//}, [windowsWidth, windowsHeight, boardWidth, boardHeight, ball, playerA, playerB, imageA, imageB]);
	useEffect(() => {
		const interval = setInterval(() => {
			updateDisplay();
		}, 1000 / 60);
		return () => clearInterval(interval);
	}, [windowsWidth, windowsHeight, boardWidth, boardHeight, ball, playerA, playerB, imageA, imageB]);
	return (
		<div id="gameMain" className="cursor">
			<Helmet>
				<meta charSet="utf-8" />
				<title>Game - transcendence </title>
			</Helmet>
			<GameBoard socket={props.socket} room={props.room} />
			<canvas ref={canvasRef} width={windowsWidth} height={windowsHeight} />
			</div>
	);
}

export default GamePlay;