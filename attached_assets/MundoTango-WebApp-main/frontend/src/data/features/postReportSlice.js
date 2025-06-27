import { createSlice } from "@reduxjs/toolkit";
import { postReportApi } from "../services/postReportApi";

const initialState = {
  data: null,
};

export const postReportSlice = createSlice({
  name: "postReport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        postReportApi.endpoints.getAllReportPosts.matchFulfilled,
        (state, { payload }) => {
          state.data = payload.data;
        }
      )
      .addMatcher(
        postReportApi.endpoints.getAllReportPosts.matchRejected,
        (state) => {
          state.data = null;
        }
      );
  },
});

export const { setDashboardInfo, unsetDashboardInfo } = postReportSlice.actions;

export default postReportSlice.reducer;
