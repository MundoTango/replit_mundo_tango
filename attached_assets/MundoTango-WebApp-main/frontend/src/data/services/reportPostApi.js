import { baseApi } from "./baseApi";
import { getToken } from "./localStorageService";

export const reportPostApi = baseApi.injectEndpoints({
  reducerPath: "reportPostApi",
  endpoints: (builder) => ({
    getAllReportType: builder.query({
      query: () => {
        return {
          url: "/report-type/get",
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    addReport: builder.mutation({
      query: (body) => {
        return {
          url: "/report/store",
          method: "POST",
          body,
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

export const { useGetAllReportTypeQuery, useAddReportMutation } = reportPostApi;
