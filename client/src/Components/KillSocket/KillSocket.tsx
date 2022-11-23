import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSockeGame, getSockeGameChat, getSockeSpectate, setSocketGame, setSocketGameChat, setSocketSpectate } from "../../Redux/gameSlice";

function KillSocket(e : string) {
    const socket = useSelector(getSockeGame);
    const socketSpectate = useSelector(getSockeSpectate);
    const socketChatGame = useSelector(getSockeGameChat);
    const dispatch = useDispatch();

    function closeSocketGame() {
        if (socket)
            socket.disconnect();
        dispatch(setSocketGame(null));
    }
    function closeSocketSpectate() {
        if (socketSpectate)
            socketSpectate.disconnect();
        dispatch(setSocketSpectate(null));
    }
    function closeSocketChatGame() {
        if (socketChatGame)
            socketChatGame.disconnect();
        dispatch(setSocketGameChat(null));
    }

	useEffect(() => {
		if (e == "all")
		{
			closeSocketGame();
			closeSocketSpectate();
			closeSocketChatGame();
		}
		else if (e == "game")
			closeSocketGame();
		else if (e == "spectate")
			closeSocketSpectate();
		else if (e == "chat")
			closeSocketChatGame();
	}, []);
    return (<></>);
}

export default KillSocket;
