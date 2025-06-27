"use client";

import GuestGuard from "@/auth/GuestGuard";
import { AuthProvider } from "@/auth/JwtContext";
import { store } from "@/store";
import { useRouter } from "next/navigation";
import { Provider } from "react-redux";
// import Login from "./auth/login/page";
import User from "./user/page";
import { useEffect } from "react";
import { PATH_AUTH } from "@/routes/paths";
import { useAuthContext } from "@/auth/useAuthContext";
import { getToken } from "@/data/services/localStorageService";
import localStorageAvailable from "@/utils/localStorageAvailable";

export default function Home() {
  const { push } = useRouter();

  useEffect(() => {
    const initialize = () => {
      const accessToken = getToken();
      if (accessToken) {
        push("/user");
      }
      else {
        push(PATH_AUTH.login);
      }
    }

    const storageAvailable = localStorageAvailable();
    if (storageAvailable) {
      initialize();
    }
  }, []);


  return (
    <main className="w-100 h-screen flex justify-center">
      <div className="main-spinner"></div>
    </main>
  );
}
