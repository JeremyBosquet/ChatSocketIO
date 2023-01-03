import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedChannel : "",
    selectedChannelDM : "",
    socket : null,
    channels: [],
    dms: [],
    refreshChannel: false,
    mode: "channel"
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,

  reducers: {
    setSocket: (state, action) => {
        state.socket = action.payload
    },
    setChannels: (state, action) => {
      state.channels = action.payload
    },    
    setDMs: (state, action) => {
      state.dms = action.payload
    },
    setMode: (state, action) => {
      state.mode = action.payload
    }
  },
});

export const { setSocket, setChannels, setDMs, setMode } = chatSlice.actions;

export const getSocket = (state : any) => state.chat.socket;
export const getChannels = (state : any) => state.chat.channels;
export const getDMs = (state : any) => state.chat.dms;
export const getMode = (state : any) => state.chat.mode;

export default chatSlice.reducer;