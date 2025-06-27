import { baseApi } from "./baseApi";
import { getToken } from "./localStorageService";

export const staticContentApi = baseApi.injectEndpoints({
  credentials: "include",
  endpoints: (builder) => ({
    getStaticContent: builder.query({
      query: ({ slug }) => {
        return {
          url: `/page/get-content-slug/${slug}`,
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
    addHelpSupport: builder.mutation({
      query: (body) => {
        return {
          url: `/user/help-support`,
          method: "POST",
          body,
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
    getFaqsQuestions: builder.query({
      query: () => {
        return {
          url: `/user/faqs`,
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
  }),
});

export const {
  useGetStaticContentQuery,
  useAddHelpSupportMutation,
  useGetFaqsQuestionsQuery,
} = staticContentApi;
