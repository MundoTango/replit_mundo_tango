import { createSlice } from "@reduxjs/toolkit";
import { userAuthApi } from "../services/userAuthApi";

const initialState = {
  user: null,
  forgotpassword: false,
  userForms: null,
  guestGuard: true,
  authFormFlag: true,
  router: '',
};

export const authSlice = createSlice({
  name: "authInfo",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload;
    },
    setForgotPassword: (state, action) => {
      state.forgotpassword = action.payload;
    },
    setGuestGuardFlag: (state, action) => {
      state.guestGuard = action.payload;
    },
    setAuthForm: (state, action) => {
      state.authFormFlag = action.payload;
    },
    setRouter: (state, action) => {
      state.router = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        userAuthApi.endpoints.loginUser.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.data;
        }
      )
      .addMatcher(userAuthApi.endpoints.loginUser.matchRejected, (state) => {
        state.user = null;
      });
  },
});

export const {
  setUserData,
  setForgotPassword,
  setGuestGuardFlag,
  setAuthForm,
  setRouter
} = authSlice.actions;

export default authSlice.reducer;
