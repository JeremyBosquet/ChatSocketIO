import React, { useEffect, useRef, useState } from "react";
import {Helmet} from "react-helmet";
import NavBar from "../../Components/Nav/NavBar";
import "./Rules.scss";

const Rules = () => { 
	return (
		<div className="RulesPage">
			<NavBar/>
		<div className="container">
			<Helmet>
					<meta charSet="utf-8" />
					<title> Rules - transcendence </title>
			</Helmet>
			<div className="rules">
				<h1>Rules</h1>
				<div className="line"></div>
				<h2>Game</h2>
				<p> Pong is a game in which you compete against another player in a game of 
					digital table tennis. The rules are simple, the two players have a board 
					positioned parallel on each side of the field, to score a point, 
					you just have to send the ball into the opposing camp by letting it 
					bounce on your board, if your opponent does not succeed. to send it back, 
					you win the point and the ball is thrown back in the middle. 
					The game ends when one of the two players reaches 10 points 
					or if one of the two players leaves the game .
				</p>
				<div className="line"></div>
				<h2>Controls</h2>
				<p> The controls are simple, by pressing the top arrow on your keyboard, 
					your board goes up, by pressing the bottom arrow, your board goes down
				</p>
				<div className="line"></div>
				<h2> Configuration </h2>
				<p> When you launch a game and you find an opponent, 
					you are placed in a game configuration menu, 
					you can then choose a map and a difficulty. 
					The final parameters of the game will be decided randomly 
					between your choices and those of your opponent.
				</p>
				<div className="line"></div>
				<h2> Where do I play ? </h2>
				<p> You have the choice between playing against random opponents 
					by clicking on the "Search for a game" button on the home page 
					or playing against your friends by inviting them from 
					discussion groups or private messages
				</p>
		</div>
		</div>
		</div>
	);
};

export default Rules;