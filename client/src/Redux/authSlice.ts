import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user : {},
    logged : false
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    setLogged: (state, action) => {
        state.logged = action.payload
    },
    setUser: (state, action) => {
        state.user = action.payload
    },
  },
});

export const { setUser, setLogged } = authSlice.actions;

export const getUser = (state : any) => state.auth.user;
export const getLogged = (state : any) => state.auth.logged;

export default authSlice.reducer;