import { isRejectedWithValue } from "@reduxjs/toolkit";
import { removeAuthToken, removeToken } from "../services/localStorageService";

const sessionMiddleware = (store) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const { status } = action.payload || {};

    if (status === 401) {
      removeToken();
      removeAuthToken();
      window.location.href = "/auth/login"
    }
  }

  return next(action);
};

export default sessionMiddleware;
