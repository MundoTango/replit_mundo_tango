"use client";
import { store } from "@/store";
import { Provider } from "react-redux";

const AuthLayout = ({ children }) => {
  return (
    <Provider store={store}>
      <div>{children}</div>
    </Provider>
  );
};

export default AuthLayout;
