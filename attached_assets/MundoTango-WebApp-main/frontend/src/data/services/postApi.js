import { baseApi } from "./baseApi";
import { getToken } from "./localStorageService";

export const postApi = baseApi.injectEndpoints({
  reducerPath: "postApi",
  endpoints: (builder) => ({
    createPost: builder.mutation({
      query: (body) => {
        return {
          url: "/post/store",
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
    getAllPosts: builder.mutation({
      query: ({
        visibility = "",
        page,
        limit = 20,
        user_id,
        group_id,
        event_id,
      }) => {
        let query = "/post/get-all-post/?";
        if (visibility) query += "visibility=" + visibility;

        query += "&is_paginated=1&page=" + page + "&limit=" + limit;

        if (user_id) query += "&user_id=" + user_id;
        if (group_id) query += "&group_id=" + group_id;
        if (event_id) query += "&event_id=" + event_id;

        return {
          url: query,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    likePost: builder.mutation({
      query: (body) => {
        return {
          url: "/post-like/store",
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    disLikePost: builder.mutation({
      query: (id) => {
        return {
          url: `/post-like/delete/${id}`,
          method: "DELETE",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    getPostComments: builder.mutation({
      query: ({ id, page }) => {
        return {
          url: `/post-comment/get-comments-by-post/${id}/?Paginated=1&limit=20&page=${page}`,
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
    postComments: builder.mutation({
      query: (body) => {
        return {
          url: `/post-comment/store`,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
    }),
    commentLike: builder.mutation({
      query: (body) => {
        return {
          url: `/comment-like/store`,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
    }),
    disLikeComment: builder.mutation({
      query: (id) => {
        return {
          url: `/comment-like/delete/${id}`,
          method: "DELETE",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
    }),
    sharePost: builder.mutation({
      query: (body) => {
        return {
          url: `/post-share/store/`,
          method: "POST",
          body,
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
    savePost: builder.mutation({
      query: (body) => {
        return {
          url: `/user/save-post`,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
    }),
    hidePost: builder.mutation({
      query: (body) => {
        return {
          url: `/user/hide-post`,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
    }),
    unSavePost: builder.mutation({
      query: (id) => {
        return {
          url: `/user/save-post/${id}`,
          method: "DELETE",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
    }),
    deletePost: builder.mutation({
      query: (id) => {
        return {
          url: `/post/delete/${id}`,
          method: "DELETE",
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
    updateFcm: builder.mutation({
      query: (body) => {
        return {
          url: `/user/update-fcm-token`,
          method: "POST",
          body,
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
    updatePost: builder.mutation({
      query: ({ formData, id }) => { 
        console.log(formData, "update");
        return {
          url: `/post/update/${id}`,
          method: "PUT",
          body: formData,
          headers: {
            // "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    travelPost: builder.mutation({
      query: (body) => { 
        console.log(body);
        return {
          url: `/post/create-event-post`,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    getPostDetails: builder.query({
      query: ({ id }) => {
        return {
          url: `/post/get-post/${id}`,
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
  }),
});

export const {
  useGetAllPostsMutation,
  useLikePostMutation,
  useDisLikePostMutation,
  useGetPostCommentsMutation,
  usePostCommentsMutation,
  useCommentLikeMutation,
  useDisLikeCommentMutation,
  useCreatePostMutation,
  useSharePostMutation,
  useSavePostMutation,
  useHidePostMutation,
  useUnSavePostMutation,
  useDeletePostMutation,
  useUpdateFcmMutation,
  useUpdatePostMutation,
  useTravelPostMutation,
  useGetPostDetailsQuery,
} = postApi;
