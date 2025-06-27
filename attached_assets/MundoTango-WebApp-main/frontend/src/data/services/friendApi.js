import { baseApi } from "./baseApi";
import { getToken } from "./localStorageService";

export const friendApi = baseApi.injectEndpoints({
  reducerPath: "friendApi",
  endpoints: (builder) => ({
    getFriendShipCard: builder.mutation({
      query: (id) => {
        return {
          url: `/friend/get-friendship-card/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
    }),
    AllFriends: builder.mutation({
      query: ({ city, event_id }) => {
        let query = "/friend/get-my-friends?";
        if (city) {
          query + `city=${city}`;
        }
        if (event_id) {
          query += `&event_id=${event_id}`;
        }
        return {
          url: query,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
          keepUnusedDataFor: 0,
          // refetchOnFocus: true,
        };
      },
    }),
    getAllFriendRequest: builder.query({
      query: () => {
        return {
          url: `/friend/get-friend-request`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
          keepUnusedDataFor: 0,
        };
      },
    }),
    updateRequestStatus: builder.mutation({
      query: ({ body, user_id }) => {
        return {
          url: `/friend/update-friend-request/${user_id}`,
          method: "PUT",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
    }),
    sendFriendRequest: builder.mutation({
      query: (body) => {
        return {
          url: `/friend/send-friend-request`,
          method: "POST",
          body,
          headers: {
            // "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
    }),
    getUserProfile: builder.query({
      query: (id) => {
        console.log("getUserProfile", id);

        return {
          url: `/user/get-user-profile/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
          keepUnusedDataFor: 0,
        };
      },
    }),
    getUserTimelineDetails: builder.query({
      query: (id) => {
        console.log("getUserTimelineDetails", id);
        return {
          url: `/user/get-user-timeline/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
          keepUnusedDataFor: 0,
        };
      },
    }),
    getALLAboutDetails: builder.query({
      query: (id) => {
        console.log("getaboutdetail", id);
        return {
          url: `/user/get-user-about/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
          keepUnusedDataFor: 0,
        };
      },
    }),
    addTravelDetail: builder.mutation({
      query: (body) => {
        return {
          url: `/user-travels/store`,
          method: "POST",
          body: body?.body,
          headers: {
            // "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
    }),
    getEventTypes: builder.query({
      query: () => {
        return {
          url: `/event-type/get`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
          keepUnusedDataFor: 0,
        };
      },
    }),
    updateProfile: builder.mutation({
      query: (body) => {
        return {
          url: `/user`,
          method: "PATCH",
          body,
          headers: {
            // "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
    }),
    getCommonThings: builder.query({
      query: (id) => {
        return {
          url: `/friend/get-common-things/${id}`,
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
    getAllUsers: builder.query({
      query: ({group_id}) => {
        let query = "/user/get-all-users?page=1&limit=100";
        if (group_id) {
          query += `&group_id=${group_id}`;
        }
        return {
          url: query,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    addMedia: builder.mutation({
      query: (body) => {
        return {
          url: "/user/add-media",
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
    blockUser: builder.mutation({
      query: (body) => {
        return {
          url: "/block-user/store",
          method: "POST",
          body,
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
    removeConnection: builder.mutation({
      query: (id) => {
        return {
          url: `/friend/destroy/${id}`,
          method: "DELETE",
          headers: {
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    unBlockUser: builder.mutation({
      query: (id) => {
        return {
          url: `/block-user/delete/${id}`,
          method: "DELETE",
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
    aboutPrivacy: builder.mutation({
      query: () => {
        return {
          url: `/user/privacy`,
          method: "PATCH",
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
    getBlockList: builder.query({
      query: () => {
        return {
          url: `/block-user/get`,
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
    travelDetail: builder.mutation({
      query: (id) => {
        return {
          url: `/user-travels/delete/${id}`,
          method: "DELETE",
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
    geteventWeMeet: builder.query({
      query: (Friend_id) => {
        return {
          url: `/event/event-we-meet/${Friend_id}`,
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
    }),
    updateTravelDetail: builder.mutation({
      query: (data) => {
        console.log("updateTravelDetail", data);
        return {
          url: `/user-travels/update/${data?.id}`,
          method: "PATCH",
          body: data?.body,
          headers: {
            // "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
    }),
  }),
});

export const {
  useGetFriendShipCardMutation,
  useAllFriendsMutation,
  useGetAllFriendRequestQuery,
  useUpdateRequestStatusMutation,
  useSendFriendRequestMutation,
  useGetUserProfileQuery,
  useGetUserTimelineDetailsQuery,
  useGetALLAboutDetailsQuery,
  useAddTravelDetailMutation,
  useGetEventTypesQuery,
  useUpdateProfileMutation,
  useGetCommonThingsQuery,
  useGetAllUsersQuery,
  useAddMediaMutation,
  useBlockUserMutation,
  useRemoveConnectionMutation,
  useUnBlockUserMutation,
  useGetBlockListQuery,
  useAboutPrivacyMutation,
  useTravelDetailMutation,
  useGeteventWeMeetQuery,
  useUpdateTravelDetailMutation,
} = friendApi;
