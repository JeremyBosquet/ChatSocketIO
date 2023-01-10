import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    socket : null,
    socketSpectate : null,
    socketGameChat : null,
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
    }

    },

});

export const { setSocketGame, setSocketSpectate, setSocketGameChat} = gameSlice.actions;

export const getSockeGame = (state : any) => state.game.socket;
export const getSockeSpectate = (state : any) => state.game.socketSpectate;
export const getSockeGameChat = (state : any) => state.game.socketGameChat;


export default gameSlice.reducer;