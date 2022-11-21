import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {},
  logged: false,
  connected: false,
  activated: false,
  socket: null
};

export const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setLogged: (state: any, action: any) => {
      state.logged = action.payload;
    },
    setUser: (state: any, action: any) => {
      state.user = action.payload;
    },
    setConnected: (state: any, action: any) => {
      state.connected = action.payload;
    },
    setActivated: (state: any, action: any) => {
      state.activated = action.payload;
    },
    setSocket: (state: any, action: any) => {
      state.socket = action.payload;
    },
  },
});

export const { setUser, setLogged, setConnected, setActivated, setSocket } = authSlice.actions;

export const getUser = (state: any) => state.auth.user;
export const getLogged = (state: any) => state.auth.logged;
export const getActivated = (state: any) => state.auth.activated;
export const getConnected = (state: any) => state.auth.connected;
export const getSocket = (state: any) => state.auth.socket;

export default authSlice.reducer;
