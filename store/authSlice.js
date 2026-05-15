import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLogin: false,
  user: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initAuth: (state, action) => {
      state.isLogin = action.payload.isLogin;
      state.user = action.payload.user || null;
      state.isInitialized = true;
    },
    loginSuccess: (state, action) => {
      state.isLogin = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isLogin = false;
      state.user = null;
    },
  },
});

export const { initAuth, loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
