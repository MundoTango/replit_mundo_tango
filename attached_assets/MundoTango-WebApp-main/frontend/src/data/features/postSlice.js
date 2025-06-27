import { createSlice } from "@reduxjs/toolkit";
import { postApi } from "../services/postApi";

const initialState = {
  data: null,
};

export const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        postApi.endpoints.getAllPosts.matchFulfilled,
        (state, { payload }) => {
          state.data = payload.data;
        }
      )
      .addMatcher(postApi.endpoints.getAllPosts.matchRejected, (state) => {
        state.data = null;
      });
  },
});

export const { setDashboardInfo, unsetDashboardInfo } = postSlice.actions;

export default postSlice.reducer;
