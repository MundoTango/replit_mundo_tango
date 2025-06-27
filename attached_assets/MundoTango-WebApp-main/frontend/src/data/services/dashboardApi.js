
import { baseApi } from "./baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  credentials: "include",
  endpoints: (builder) => ({
    getDashboardDetails: builder.query({
      query: () => {
        return {
          url: "get-dashboard",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
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
export const { useGetDashboardDetailsQuery } = dashboardApi;
