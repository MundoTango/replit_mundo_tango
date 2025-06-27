import { baseApi } from "./baseApi";
import { getToken } from "./localStorageService";

export const groupApi = baseApi.injectEndpoints({
  reducerPath: "groupApi",
  endpoints: (builder) => ({
      addGroup: builder.mutation({
        query: (body) => {
          return {
            url: 'group/store',
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
      getAllGroups: builder.mutation({
        query: ({city},body) => {
          let query = '/group/get'
          if (city) query += `&city=${city}`;
          return {
            url: query,
            method: "GET",
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
      getGroupById: builder.query({
        query: (id) => {
          return {
            url: `/group/get/${id}`,
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
      getAllMembers: builder.query({
        query: ({ page, limit = '', search = '' }) => ({
          url: `/user/get-all-users?page=${page}&limit=${limit}`,
          method: 'GET',
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Authorization': `Bearer ${getToken()}`,
          },
        }),
        keepUnusedDataFor: 0,
        refetchOnFocus: true,
      }),
      leaveGroup: builder.mutation({
        query: (id) => {
          return {
            url: `group/leave-group/${id}`,
            method: "POST",
            headers: {
              // "Content-type": "application/json; charset=UTF-8",
              authorization: getToken(),
            },
          };
        },
        keepUnusedDataFor: 0,
        refetchOnFocus: true,
      }),
      pinGroup: builder.mutation({
        query: (body) => {
          return {
            url: `group/pin-group`,
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
      updateRequestGroup: builder.mutation({
        query: ({id, status}) => {
          return {
            url: `group/update-request/${id}`,
            method: "PUT",
            body: {status: status},
            headers: {
              // "Content-type": "application/json; charset=UTF-8",
              authorization: getToken(),
            },
          };
        },
        keepUnusedDataFor: 0,
        refetchOnFocus: true,
      }),
      getGroupMembers: builder.query({
        query: (id) => ({
          url: `/group/get-group-members/${id}`,
          method: 'GET',
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Authorization': `Bearer ${getToken()}`,
          },
        }),
        keepUnusedDataFor: 0,
        refetchOnFocus: true,
      }),
      invitationGroup: builder.mutation({
        query: (body) => {
          return {
            url: `/group/group-invitation`,
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
      requestJoinGroup: builder.mutation({
        query: (body) => {
          return {
            url: `group/request-join-group`,
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
      getGroupTimelineDetails: builder.query({
        query: (id) => {
          console.log("getUserTimelineDetails", id);
          return {
            url: `/group/group-timeline/${id}`,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
              authorization: getToken(),
            },
            keepUnusedDataFor: 0,
          };
        },
      }),
      addVisitor: builder.mutation({
        query: (body) => {
          return {
            url: `/group/visit-group`,
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
      getVisitors: builder.query({
        query: (id) => {
          return {
            url: `/group/group-visitors/${id}`,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
              authorization: getToken(),
            },
            keepUnusedDataFor: 0,
          };
        },
      }),
      getGroupRequest: builder.query({
        query: (id) => {
          return {
            url: `/group/get-group-request/${id}`,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
              authorization: getToken(),
            },
            keepUnusedDataFor: 0,
          };
        },
      }),
      deleteGroup: builder.mutation({
        query: (id) => {
          return {
            url: `/group/delete/${id}`,
            method: "DELETE",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
              authorization: getToken(),
            },
          };
        },
      }),
      updateGroup: builder.mutation({
        query: (data) => {
          return {
            url: `group/update/${data?.id}`,
            method: "PATCH",
            body: data?.body,
            headers: {
              // "Content-type": "application/json; charset=UTF-8",
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
    useAddGroupMutation,
    useGetAllGroupsMutation,
    useGetAllMembersQuery,
    useGetGroupByIdQuery,
    useLeaveGroupMutation,
    usePinGroupMutation,
    useUpdateRequestGroupMutation,
    useGetGroupMembersQuery,
    useInvitationGroupMutation,
    useRequestJoinGroupMutation,
    useGetGroupTimelineDetailsQuery,
    useAddVisitorMutation,
    useGetVisitorsQuery,
    useGetGroupRequestQuery,
    useDeleteGroupMutation,
    useUpdateGroupMutation,
} = groupApi;

