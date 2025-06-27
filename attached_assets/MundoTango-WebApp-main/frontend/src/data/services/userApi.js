import { baseApi } from "./baseApi";

import { CREATE_USER_IMAGE, GET_USER_IMAGES } from "@/utils/API_URL";
import { getAuthToken } from "./localStorageService";

export const userApi = baseApi.injectEndpoints({
  reducerPath: "userApi",
  endpoints: (builder) => ({
    // updateUser: builder.mutation({
    //   query: (modifiedData) => {
    //     return {
    //       url: "update-user",
    //       method: "PATCH",
    //       body: modifiedData,
    //       headers: {
    //         "Content-type": "application/json; charset=UTF-8",
    //       },
    //     };
    //   },
    // }),
    // deleteUser: builder.mutation({
    //   query: (slug) => {
    //     return {
    //       url: `delete-user/${slug}`,
    //       method: "DELETE",
    //       headers: {
    //         "Content-type": "application/json; charset=UTF-8",
    //       },
    //     };
    //   },
    // }),
    // getAllUsers: builder.query({
    //   query: () => {
    //     return {
    //       url: "user-list",
    //       method: "GET",
    //       headers: {
    //         "Content-type": "application/json; charset=UTF-8",
    //       },
    //     };
    //   },
    //   keepUnusedDataFor: 0,
    //   refetchOnFocus: true,
    // }),
    uploadUserImages: builder.mutation({
      query: (body) => {
        return {
          url: CREATE_USER_IMAGE,
          method: "POST",
          body,
          headers: {
            authorization: getAuthToken(),
          },
          formData: true,
        };
      },
    }),
    getUserUploadedImages: builder.mutation({
      query: (body) => {
        return {
          url: GET_USER_IMAGES,
          method: "GET",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
  }),
});

export const {
  useUploadUserImagesMutation,
  useGetUserUploadedImagesMutation,
} = userApi;
