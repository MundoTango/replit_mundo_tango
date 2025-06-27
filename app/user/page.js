"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/auth/useAuthContext";
import { PATH_AUTH, PATH_DASHBOARD } from "@/routes/paths";
import { getToken } from "@/data/services/localStorageService";
import localStorageAvailable from "@/utils/localStorageAvailable";

export default function UserPage() {
  const { push } = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuthContext();

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = getToken();
      if (!accessToken || (!isAuthenticated && isInitialized)) {
        push(PATH_AUTH.login);
      } else if (isAuthenticated && user) {
        push(PATH_DASHBOARD.timeline);
      }
    };

    const storageAvailable = localStorageAvailable();
    if (storageAvailable) {
      checkAuth();
    }
  }, [isAuthenticated, isInitialized, user, push]);

  if (!isInitialized) {
    return (
      <div className="w-100 h-screen flex justify-center items-center">
        <div className="main-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-100 h-screen flex justify-center items-center">
        <div className="main-spinner"></div>
      </div>
    );
  }

  return (
    <div className="w-100 h-screen flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Mundo Tango</h1>
        <p className="text-gray-600">Redirecting to your timeline...</p>
        <div className="main-spinner mx-auto mt-4"></div>
      </div>
    </div>
  );
}