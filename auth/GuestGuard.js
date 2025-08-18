"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./useAuthContext";
import { PATH_DASHBOARD } from "@/routes/paths";

export default function GuestGuard({ children }) {
  const { push } = useRouter();
  const { isAuthenticated, isInitialized } = useAuthContext();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      push(PATH_DASHBOARD.root);
    }
  }, [isAuthenticated, isInitialized, push]);

  if (isInitialized && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}