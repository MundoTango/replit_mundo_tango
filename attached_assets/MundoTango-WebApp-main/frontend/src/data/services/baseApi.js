import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "./localStorageService";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      headers.set("token", process.env.STATIC_TOKEN);
      let auth_token = getToken();
      if (auth_token) {
        headers.set("authorization", auth_token);
      }

      return headers;
    },
  }),
  endpoints: () => ({}),
});
