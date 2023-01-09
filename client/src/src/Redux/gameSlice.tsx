import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICanvasBall, ICanvasBoard } from "../Components/GamePlay/Interfarces/GameInterace";

const initialState = {
    socket : null,
    socketSpectate : null,
    socketGameChat : null,
    windowsWidth : 0,
    windowsHeight : 0,
    boardWidth : 0,
    boardHeight : 0,
    ball : {},
    playerA : {},
    playerB : {},
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,

  reducers: {
    setSocketGame: (state, action) => {
        state.socket = action.payload
    },
    
    setSocketSpectate: (state, action) => {
        state.socketSpectate = action.payload
    },
    
    setSocketGameChat: (state, action) => {
        state.socketGameChat = action.payload
    },

    setWindowsWidth : (state, action : PayloadAction<number>) => {
        state.windowsWidth = action.payload
    },

    setWindowsHeight : (state, action : PayloadAction<number>) => {
        state.windowsHeight = action.payload
    },

    setBoardWidth : (state, action : PayloadAction<number>) => {
        state.boardWidth = action.payload
    },

    setBoardHeight : (state, action : PayloadAction<number>) => {
        state.boardHeight = action.payload
    },

    setBall : (state, action : PayloadAction<ICanvasBall>) => {
        state.ball = action.payload
    },

    setPlayerA : (state, action : PayloadAction<ICanvasBoard>) => {
        state.playerA = action.payload
    },

    setPlayerB : (state, action : PayloadAction<ICanvasBoard>) => {
        state.playerB = action.payload
    },

    },

});

export const { setSocketGame, setSocketSpectate, setSocketGameChat, setWindowsWidth, setWindowsHeight, setBoardWidth, setBoardHeight, setBall, setPlayerA, setPlayerB} = gameSlice.actions;

export const getSockeGame = (state : any) => state.game.socket;
export const getSockeSpectate = (state : any) => state.game.socketSpectate;
export const getSockeGameChat = (state : any) => state.game.socketGameChat;
export const getWindowsWidth = (state : any) => state.game.windowsWidth;
export const getWindowsHeight = (state : any) => state.game.windowsHeight;
export const getBoardWidth = (state : any) => state.game.boardWidth;
export const getBoardHeight = (state : any) => state.game.boardHeight;
export const getBall = (state : any) => state.game.ball;
export const getPlayerA = (state : any) => state.game.playerA;
export const getPlayerB = (state : any) => state.game.playerB;


export default gameSlice.reducer;