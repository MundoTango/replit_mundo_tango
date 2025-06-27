"use client";
import GuestGuard from "@/auth/GuestGuard";
import { AuthProvider } from "@/auth/JwtContext";
import { store } from "@/store";
import { Provider } from "react-redux";

const AuthLayout = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <GuestGuard>
          <div>{children}</div>
        </GuestGuard>
      </AuthProvider>
    </Provider>
  );
};

export default AuthLayout;
