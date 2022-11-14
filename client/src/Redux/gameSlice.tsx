import { createSlice } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';

const initialState = {
    socket : null,
    socketSpectate : null,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,

  reducers: {
    setSocketGame: (state, action) => {
        state.socket = action.payload
    },
    
    setSocketSpectate: (state, action) => {
        state.socket = action.payload
    }
    },

});

export const { setSocketGame, setSocketSpectate} = gameSlice.actions;

export const getSockeGame = (state : any) => state.game.socket;
export const getSockeSpectate = (state : any) => state.game.socketSpectate;

export default gameSlice.reducer;