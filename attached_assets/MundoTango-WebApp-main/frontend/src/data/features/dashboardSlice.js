import { createSlice } from "@reduxjs/toolkit";
import { dashboardApi } from "../services/dashboardApi";

const initialState = {
  data: null,
};

export const dashboardSlice = createSlice({
  name: "dashboardInfo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        dashboardApi.endpoints.getDashboardDetails.matchFulfilled,
        (state, { payload }) => {
          state.data = payload.data;
        }
      )
      .addMatcher(
        dashboardApi.endpoints.getDashboardDetails.matchRejected,
        (state) => {
          state.data = null;
        }
      );
  },
});

export const { setDashboardInfo, unsetDashboardInfo } = dashboardSlice.actions;

export default dashboardSlice.reducer;
