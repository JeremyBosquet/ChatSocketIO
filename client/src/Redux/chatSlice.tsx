import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedChannel : "",
    selectedChannelDM : "",
    socket : null,
    channels: [],
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
    setMode: (state, action) => {
      state.mode = action.payload
    }
  },
});

export const { setSocket, setChannels, setMode } = chatSlice.actions;

// export const getSelectedChannel = (state : any) => state.chat.selectedChannel;
// export const getSelectedChannelDM = (state : any) => state.chat.selectedChannelDM;
export const getSocket = (state : any) => state.chat.socket;
export const getChannels = (state : any) => state.chat.channels;
export const getMode = (state : any) => state.chat.mode;

export default chatSlice.reducer;