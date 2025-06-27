"use client";
import { setAuthForm } from "@/data/features/authSlice";
import { getAuthToken, getToken } from "@/data/services/localStorageService";
import { PATH_AUTH, PATH_DASHBOARD } from "@/routes/paths";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// ----------------------------------------------------------------------

AuthFormGuard.propTypes = {
  children: PropTypes.node,
};

export default function AuthFormGuard({ children }) {
  const isAuthenticate = typeof window !== "undefined" ? getToken() : null;
  const isAuthToken = typeof window !== "undefined" ? getAuthToken() : null;

  const { push } = useRouter();

  const loading = useSelector((state) => state.auth.authFormFlag);

  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticate) {
      push(PATH_DASHBOARD.root);
      return;
    } else if (!isAuthenticate && !isAuthToken) {
      push(PATH_AUTH.login);
      return;
    }

    const timeout = setTimeout(() => {
      dispatch(setAuthForm(false));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isAuthenticate, isAuthToken]);

  // console.log(loading);

  if (loading)
    return (
      <main className="w-100 h-screen flex justify-center">
        <div className="main-spinner"></div>
      </main>
    );

  return <> {children} </>;
}
