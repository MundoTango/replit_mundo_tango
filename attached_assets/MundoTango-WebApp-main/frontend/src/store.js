"use client";
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./data/features/authSlice";
import userSlice from "./data/features/userSlice";

import { userAuthApi } from "./data/services/userAuthApi";
import { userFormsApi } from "./data/services/userFormsApi";
import sessionMiddleware from "./data/middleware/sessionMiddleware";
import { postApi } from "./data/services/postApi";

export const store = configureStore({
  reducer: {
    [userAuthApi.reducerPath]: userAuthApi.reducer,
    [userFormsApi.reducerPath]: userFormsApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    auth: authSlice,
    user: userSlice,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      userAuthApi.middleware,
      userFormsApi.middleware,
      postApi.middleware,
      sessionMiddleware,
    ]),
});
