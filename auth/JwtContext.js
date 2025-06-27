"use client";

import { createContext, useCallback, useEffect, useMemo, useReducer } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axios";
import { getToken, storeToken, removeToken } from "@/data/services/localStorageService";
import localStorageAvailable from "@/utils/localStorageAvailable";
import { PATH_AUTH, PATH_DASHBOARD } from "@/routes/paths";

const AuthContext = createContext({});

const ROOT = "/user/me";
const LOGIN = "/user/login";

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INITIAL":
      return {
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        user: action.payload.user,
      };
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case "LOGOUT":
      removeToken();
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { push } = useRouter();

  const storageAvailable = localStorageAvailable();

  const initialize = useCallback(async () => {
    try {
      const accessToken = storageAvailable ? getToken() : "";

      if (accessToken) {
        storeToken(accessToken);

        const response = await axiosInstance.get(ROOT, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const { data } = response.data;

        localStorage.setItem("type", data.form_status);
        dispatch({
          type: "INITIAL",
          payload: {
            isAuthenticated: true,
            user: data,
          },
        });
      } else {
        dispatch({
          type: "INITIAL",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: "INITIAL",
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  }, [storageAvailable]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = useCallback(async (record) => {
    const response = await axiosInstance.post(LOGIN, {
      ...record,
    });

    const { data, code, message } = response.data;
    if (code == 200) {
      toast.success(message);
      dispatch({
        type: "LOGIN",
        payload: {
          user: data,
        },
      });

      push(PATH_DASHBOARD.root);
    } else {
      toast.error("Something went wrong");
    }
  }, [push]);

  const logout = useCallback(() => {
    dispatch({
      type: "LOGOUT",
    });
  }, []);

  const memoizedValue = useMemo(
    () => ({
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      method: "jwt",
      dispatch,
      login,
      logout,
    }),
    [state.isAuthenticated, state.isInitialized, state.user, login, logout]
  );

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };