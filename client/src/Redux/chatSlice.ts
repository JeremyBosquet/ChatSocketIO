import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedChannel : "",
    socket : null,
    channels: []
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,

  reducers: {
    setSelectedChannel: (state, action) => {
        state.selectedChannel = action.payload
    },
    setSocket: (state, action) => {
        state.socket = action.payload
    },
    setChannels: (state, action) => {
      state.channels= action.payload
    }
  },
});

export const { setSelectedChannel, setSocket, setChannels } = chatSlice.actions;

export const getSelectedChannel = (state : any) => state.chat.selectedChannel;
export const getSocket = (state : any) => state.chat.socket;
export const getChannels = (state : any) => state.chat.channels;

export default chatSlice.reducer;