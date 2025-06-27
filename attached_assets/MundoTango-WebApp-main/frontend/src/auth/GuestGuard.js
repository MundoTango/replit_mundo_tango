"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import PropTypes from "prop-types";
import { PATH_DASHBOARD } from "../routes/paths";
import { useAuthContext } from "./useAuthContext";
import { getAuthToken } from "@/data/services/localStorageService";
import { FormStatePath } from "@/utils/helper";

// ----------------------------------------------------------------------

GuestGuard.propTypes = {
  children: PropTypes.node,
};

function GuestGuardComponent({ children }) {
  const { push } = useRouter();
  let authToken = typeof window !== "undefined" ? getAuthToken() : null;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { isAuthenticated, isInitialized } = useAuthContext();
  console.log(isAuthenticated, isInitialized, authToken, (isInitialized === isAuthenticated) || authToken, "guest");

  const fullPath = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;


  useEffect(() => {
    if (isAuthenticated) {
      if (pathname && pathname == PATH_DASHBOARD.root) {
        push("/user/timeline");
      } else {
        if (fullPath?.startsWith("/user/")) {
          push(fullPath);
        } else {
          push(PATH_DASHBOARD.root);
        }
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let type = localStorage.getItem("type");
    if (authToken && type < 13) {
      push(FormStatePath(type));
    }
  }, [authToken]);

  if (!isInitialized) {
    return (
      <main className="w-100 h-screen flex justify-center">
        <div className="main-spinner"></div>
      </main>
    );
  }

  return <>{children}</>;
}

export default function GuestGuard(props) {
  return (
    <Suspense
      fallback={
        <main className="w-100 h-screen flex justify-center">
          <div className="main-spinner"></div>
        </main>
      }
    >
      <GuestGuardComponent {...props} />
    </Suspense>
  );
}
