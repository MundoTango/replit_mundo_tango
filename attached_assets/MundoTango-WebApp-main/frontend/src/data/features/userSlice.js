import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  router: 'push'
};

export const userSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload;
    },
    setRouter: (state, action) => {
      state.router = action.payload;
    },
  },
});

export const { setUserData, setRouter } = userSlice.actions;

export default userSlice.reducer;
