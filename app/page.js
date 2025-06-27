"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
  }, [push]);

  return (
    <main className="w-100 h-screen flex justify-center items-center">
      <div className="main-spinner"></div>
    </main>
  );
}