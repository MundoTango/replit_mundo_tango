// Need to use the React-specific entry point to import createApi

import { baseApi } from "./baseApi";

// using CSRF token from Redux Store

// Define a service using a base URL and expected endpoints
export const settingApi = baseApi.injectEndpoints({
  reducerPath: "settingApi",

  // mode: "no-cors",
  // credentials: "include",
  endpoints: (builder) => ({
    changePassword: builder.mutation({
      query: (data) => {
        return {
          url: "change-password",
          method: "POST",
          body: data,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
    }),
    addOrUpdateStaticPages: builder.mutation({
      query: (data) => {
        return {
          url: "add-static-content",
          method: "POST",
          body: data,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      invalidatesTags: ["Static"],
    }),
    getStaticPages: builder.query({
      query: () => {
        return {
          url: "get-static-content",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
      providesTags: ["Static"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useChangePasswordMutation,
  useAddOrUpdateStaticPagesMutation,
  useGetStaticPagesQuery,
} = settingApi;
