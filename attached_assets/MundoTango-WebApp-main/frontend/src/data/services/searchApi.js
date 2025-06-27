import { baseApi } from "./baseApi";
import { getToken } from "./localStorageService";

export const searchApi = baseApi.injectEndpoints({
  credentials: "include",
  endpoints: (builder) => ({
    globalSearch: builder.query({
      query: ({ query, type = "" }) => {
        return {
          url: `/user/global-search?search=${query}&type=${type}`,
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
  }),
});

export const { useGlobalSearchQuery } = searchApi;
