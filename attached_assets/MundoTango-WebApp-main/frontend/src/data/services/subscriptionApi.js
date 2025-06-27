// Need to use the React-specific entry point to import createApi

import { baseApi } from "./baseApi";
import { getToken } from "./localStorageService";

// using CSRF token from Redux Store

// Define a service using a base URL and expected endpoints
export const subscriptionApi = baseApi.injectEndpoints({
  reducerPath: "subscriptionApi",

  // mode: "no-cors",
  credentials: "include",
  endpoints: (builder) => ({
    getSubscriptions: builder.query({
      query: () => {
        return {
          url: "/subscription/get",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            // authorization: `Bearer ${getToken()}`,
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    addSubscription: builder.mutation({
      query: (body) => {
        return {
          url: `/subscription/create-session-checkout`,
          method: "POST",
          body,
          headers: {
            // "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    getActiveSubscriptions: builder.query({
      query: () => {
        return {
          url: "/subscription/get-subscription-status",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            // authorization: `Bearer ${getToken()}`,
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetSubscriptionsQuery,
  useAddSubscriptionMutation,
  useGetActiveSubscriptionsQuery,
} = subscriptionApi;
