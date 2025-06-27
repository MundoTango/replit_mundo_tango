import { baseApi } from "./baseApi";
import { getToken } from "./localStorageService";

export const tangoDetails = baseApi.injectEndpoints({
  credentials: "include",
  endpoints: (builder) => ({
    getMundoTangoDetail: builder.query({
      query: () => {
        return {
          url: "/user/mundotango-details",
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
  }),
});

export const { useGetMundoTangoDetailQuery } = tangoDetails;
