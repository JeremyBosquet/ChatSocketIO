import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {},
  logged: false,
  connected: false,
  activated: false,
  socket: null, 
  friendList : [],
  blockList : [],
  requestedList : [],
  requestList: [],
  historyList: [],
  profilePage: null,
  profileDisplayed : false,
  userImg : undefined,
  UserUsername : "",
  connectedList : [],
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
    setSocketSocial: (state: any, action: any) => {
      state.socket = action.payload;
    },
	setFriendList: (state: any, action: any) => {
		state.friendList = action.payload;
	},
	setBlockList: (state: any, action: any) => {
		state.blockList = action.payload;
	},
	setRequestedList: (state: any, action: any) => {
		state.requestedList = action.payload;
	},
	setRequestList: (state: any, action: any) => {
		state.requestList = action.payload;
	},
	setHistoryList: (state: any, action: any) => {
		state.historyList = action.payload;
	},
	setProfilePage: (state: any, action: any) => {
		state.profilePage = action.payload;
	},
	setProfileDisplayed: (state: any, action: any) => {
		state.profileDisplayed = action.payload;
	},
	setUserImg: (state: any, action: any) => {
		state.userImg = action.payload;
	},
	setUserUsername: (state: any, action: any) => {
		state.userUsername = action.payload;
	},
	setConnectedList: (state: any, action: any) => {
		state.connectedList = action.payload;
	},
  },
});

export const { setUser, setLogged, setConnected, setActivated, setSocketSocial, setFriendList, setBlockList, setHistoryList, setProfileDisplayed, setProfilePage, setRequestList, setRequestedList, setUserImg, setUserUsername, setConnectedList } = authSlice.actions;

export const getUser = (state: any) => state.auth.user;
export const getLogged = (state: any) => state.auth.logged;
export const getActivated = (state: any) => state.auth.activated;
export const getConnected = (state: any) => state.auth.connected;
export const getSocketSocial = (state: any) => state.auth.socket;
export const getFriendList = (state: any) => state.auth.friendList;
export const getBlockList = (state: any) => state.auth.blockList;
export const getRequestedList = (state: any) => state.auth.requestedList;
export const getRequestList = (state: any) => state.auth.requestList;
export const getHistoryList = (state: any) => state.auth.historyList;
export const getProfilePage = (state: any) => state.auth.profilePage;
export const getProfileDisplayed = (state: any) => state.auth.profileDisplayed;
export const getUserImg = (state: any) => state.auth.userImg;
export const getUserUsername = (state: any) => state.auth.userUsername;
export const getConnectedList = (state: any) => state.auth.connectedList;

export default authSlice.reducer;
