import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedChannel : ""
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,

  reducers: {
    setSelectedChannel: (state, action) => {
        state.selectedChannel = action.payload
    },
  },
});

export const { setSelectedChannel } = chatSlice.actions;

export const getSelectedChannel = (state : any) => state.chat.selectedChannel;

export default chatSlice.reducer;