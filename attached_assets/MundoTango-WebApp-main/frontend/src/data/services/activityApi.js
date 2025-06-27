import { baseApi } from "./baseApi";
import { getToken } from "./localStorageService";

export const activityApi = baseApi.injectEndpoints({
  credentials: "include",
  endpoints: (builder) => ({
    getActivityList: builder.query({
      query: ({search}) => {
        return {
          url: `/activity/get?search=${search}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
      // keepUnusedDataFor: 0,
      // refetchOnFocus: true,
    }),
    addActivity: builder.mutation({
      query: (body) => {
        return {
          url: "/activity/store",
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
          body: body
        };
      },
      // keepUnusedDataFor: 0,
      // refetchOnFocus: true,
    }),
    nonTangoActivity: builder.mutation({
      query: (body) => {
        return {
          url: "/non-tango-activity/store",
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
          body: body
        };
      },
      // keepUnusedDataFor: 0,
      // refetchOnFocus: true,
    }),
  }),
});

export const { 
  useGetActivityListQuery,
  useAddActivityMutation,
  useNonTangoActivityMutation,
 } = activityApi;
