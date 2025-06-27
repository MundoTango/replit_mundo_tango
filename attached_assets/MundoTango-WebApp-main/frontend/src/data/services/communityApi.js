import { baseApi } from "./baseApi";
import { getToken } from "./localStorageService";

export const communityApi = baseApi.injectEndpoints({
  reducerPath: "communityApi",
  endpoints: (builder) => ({
    getCommunityAboutDetails: builder.query({
      query: (id) => {
        return {
          url: `/user/get-city-about/${id}`,
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    getGroupsDetails: builder.query({
      query: (city) => {
        return {
          url: `/group/get-city-group/${city}`,
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    getEventsListDetails: builder.query({
      query: (city) => {
        return {
          url: `/event/get-city-event/${city}`,
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
  }),
});

export const {
  useGetCommunityAboutDetailsQuery,
  useGetGroupsDetailsQuery,
  useGetEventsListDetailsQuery,
} = communityApi;
