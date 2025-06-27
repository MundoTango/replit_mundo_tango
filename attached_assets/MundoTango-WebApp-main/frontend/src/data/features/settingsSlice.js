import { createSlice } from "@reduxjs/toolkit";
import { settingApi } from "../services/settingApi";

const initialState = {
  pages: [],
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        settingApi.endpoints.getStaticPages.matchFulfilled,
        (state, { payload }) => {
          state.pages = payload.data;
        }
      )
      .addMatcher(
        settingApi.endpoints.getStaticPages.matchRejected,
        (state) => {
          state.pages = null;
        }
      );
  },
});

export const { setUserInfo, unsetUserInfo, updateUsers } =
  settingsSlice.actions;

export default settingsSlice.reducer;
