import { baseApi } from "./baseApi";
import { getToken } from "./localStorageService";

export const notificationApi = baseApi.injectEndpoints({
  reducerPath: "notificationApi",
  endpoints: (builder) => ({
    sentNotification: builder.mutation({
      query: (data) => {
        return {
          url: "send-notification",
          method: "POST",
          body: data,
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
    notificationListing: builder.query({
      query: ({ userId, isRead = 1 }) => {
        return {
          url: `/notification/get?user_id=${userId}&is_read=${isRead}`,
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
    readNotification: builder.mutation({
      query: (id) => {
        return {
          url: `/notification/read-notification/${id}`,
          method: "PUT",
          // body: formData,
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
  useSentNotificationMutation,
  useNotificationListingQuery,
  useReadNotificationMutation,
} = notificationApi;
