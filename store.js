import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./data/services/baseApi";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [baseApi.util.type],
      },
    }).concat(baseApi.middleware),
});