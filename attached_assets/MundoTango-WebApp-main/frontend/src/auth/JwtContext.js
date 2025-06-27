"use client";
import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import axiosInstance from "../utils/axios";
// utils
import localStorageAvailable from "../utils/localStorageAvailable";
//
import {
  getAuthToken,
  getToken,
  storeToken,
} from "@/data/services/localStorageService";
import { FORM_PATH, PATH_DASHBOARD } from "@/routes/paths";
import { LOGIN, ROOT } from "@/utils/API_URL";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

const initialState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

const reducer = (state, action) => {
  if (action.type === "INITIAL") {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }
  if (action.type === "LOGIN") {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === "UPDATEUSER") {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === "LOGOUT") {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  }

  return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext(null);

// ----------------------------------------------------------------------

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export function AuthProvider({ children }) {
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
      // throw new Error("Something went wrong");
      toast.error("Something went wrong");
    }
  }, []);

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
