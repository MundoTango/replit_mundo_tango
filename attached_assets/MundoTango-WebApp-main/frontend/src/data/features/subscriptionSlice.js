import { createSlice } from "@reduxjs/toolkit";
import { subscriptionApi } from "../services/subscriptionApi";

const initialState = {
  data: null,
};

export const subscriptionSlice = createSlice({
  name: "subscriptionInfo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        subscriptionApi.endpoints.getSubscriptionDetails.matchFulfilled,
        (state, { payload }) => {
          state.data = payload.data;
        }
      )
      .addMatcher(
        subscriptionApi.endpoints.getSubscriptionDetails.matchRejected,
        (state) => {
          state.data = null;
        }
      );
  },
});

export const { setDashboardInfo, unsetDashboardInfo } =
  subscriptionSlice.actions;

export default subscriptionSlice.reducer;
