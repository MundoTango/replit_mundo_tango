import { baseApi } from "./baseApi";
import { getToken } from "./localStorageService";

export const eventApi = baseApi.injectEndpoints({
  reducerPath: "eventApi",
  endpoints: (builder) => ({
    addEvent: builder.mutation({
      query: (body) => {
        return {
          url: "event/store",
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
    getAllEvents: builder.query({
      query: (body) => {
        return {
          url: `/event/get`,
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
    eventById: builder.mutation({
      query: (id) => {
        return {
          url: `/event/get/${id}`,
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
    allGuests: builder.mutation({
      query: (id) => {
        console.log(id);
        return {
          url: `/event/get-event-members/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${getToken()}`,
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    // leaveEvent: builder.mutation({
    //   query: (id) => {
    //     return {
    //       url: `Event/leave-Event/${id}`,
    //       method: "POST",
    //       headers: {
    //         // "Content-type": "application/json; charset=UTF-8",
    //         authorization: getToken(),
    //       },
    //     };
    //   },
    //   keepUnusedDataFor: 0,
    //   refetchOnFocus: true,
    // }),
    // pinEvent: builder.mutation({
    //   query: (body) => {
    //     return {
    //       url: `Event/pin-Event`,
    //       method: "POST",
    //       body,
    //       headers: {
    //         // "Content-type": "application/json; charset=UTF-8",
    //         authorization: getToken(),
    //       },
    //     };
    //   },
    //   keepUnusedDataFor: 0,
    //   refetchOnFocus: true,
    // }),
    // updateRequestEvent: builder.mutation({
    //   query: ({id, status}) => {
    //     return {
    //       url: `Event/update-request/${id}`,
    //       method: "PUT",
    //       body: {status: status},
    //       headers: {
    //         // "Content-type": "application/json; charset=UTF-8",
    //         authorization: getToken(),
    //       },
    //     };
    //   },
    //   keepUnusedDataFor: 0,
    //   refetchOnFocus: true,
    // }),
    // getEventMembers: builder.query({
    //   query: (id) => ({
    //     url: `/Event/get-Event-members/${id}`,
    //     method: 'GET',
    //     headers: {
    //       'Content-type': 'application/json; charset=UTF-8',
    //       'Authorization': `Bearer ${getToken()}`,
    //     },
    //   }),
    //   keepUnusedDataFor: 0,
    //   refetchOnFocus: true,
    // }),
    // invitationEvent: builder.mutation({
    //   query: (body) => {
    //     return {
    //       url: `/Event/Event-invitation`,
    //       method: "POST",
    //       body,
    //       headers: {
    //         // "Content-type": "application/json; charset=UTF-8",
    //         authorization: getToken(),
    //       },
    //     };
    //   },
    //   keepUnusedDataFor: 0,
    //   refetchOnFocus: true,
    // }),
    requestJoinEvent: builder.mutation({
      query: (body) => {
        return {
          url: `event/interested-event`,
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
    goingEvent: builder.mutation({
      query: (body) => {
        return {
          url: `event/going-event`,
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
    inviteEvent: builder.mutation({
      query: (body) => {
        return {
          url: `event/event-invitation`,
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
    getEventTypes: builder.query({
      query: (body) => {
        return {
          url: `/event-type/get`,
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
    getNonTangoActivities: builder.query({
      query: (body) => {
        return {
          url: `/non-tango-activity/get`,
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
    getEventTimelineDetails: builder.query({
      query: (id) => {
        return {
          url: `/event/event-timeline/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
          keepUnusedDataFor: 0,
        };
      },
    }),
    // addVisitor: builder.mutation({
    //   query: (body) => {
    //     return {
    //       url: `/event/visit-event`,
    //       method: "POST",
    //       body,
    //       headers: {
    //         // "Content-type": "application/json; charset=UTF-8",
    //         authorization: getToken(),
    //       },
    //     };
    //   },
    //   keepUnusedDataFor: 0,
    //   refetchOnFocus: true,
    // }),
    // getVisitors: builder.query({
    //   query: (id) => {
    //     return {
    //       url: `/event/event-visitors/${id}`,
    //       method: "GET",
    //       headers: {
    //         "Content-type": "application/json; charset=UTF-8",
    //         authorization: getToken(),
    //       },
    //       keepUnusedDataFor: 0,
    //     };
    //   },
    // }),
    getEventRequest: builder.query({
      query: (id) => {
        return {
          url: `/event/get-event-request/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
          keepUnusedDataFor: 0,
        };
      },
    }),
    deleteEvent: builder.mutation({
      query: (id) => {
        return {
          url: `/event/delete/${id}`,
          method: "DELETE",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
    }),
    getEventWithLocations: builder.query({
      query: ({ query_type = 1, city }) => {
        return {
          url: `/event/get?query_type=${query_type}&city=${city}`,
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    getAllEventsByCity: builder.mutation({
      query: ({ query_type = 1, city }) => {
        return {
          url: `/event/get?query_type=${query_type}&city=${city}`,
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    eventChartData: builder.mutation({
      query: (id) => {
        return {
          url: `/event/chart-data/${id}`,
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    getUpcomingEvents: builder.query({
      query: () => {
        return {
          url: `/event/upcoming-event`,
          method: "GET",
          headers: {
            authorization: getToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    getEventTimelineDetails: builder.query({
      query: (id) => {
        return {
          url: `/event/event-timeline/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
          keepUnusedDataFor: 0,
        };
      },
    }),
    deleteEvent: builder.mutation({
      query: (id) => {
        return {
          url: `/event/delete/${id}`,
          method: "DELETE",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getToken(),
          },
        };
      },
    }),
    updateEvent: builder.mutation({
      query: (data) => {
        return {
          url: `/event/update/${data?.id}`,
          method: "PUT",
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
  useAddEventMutation,
  useGetAllEventsQuery,
  useEventByIdMutation,
  useAllGuestsMutation,
  useInvitationEventMutation,
  useRequestJoinEventMutation,
  useGoingEventMutation,
  useInviteEventMutation,
  useGetEventTypesQuery,
  useGetNonTangoActivitiesQuery,
  useGetEventWithLocationsQuery,
  useGetAllEventsByCityMutation,
  useEventChartDataMutation,
  useGetUpcomingEventsQuery,
  useGetEventTimelineDetailsQuery,
  useDeleteEventMutation,
  useUpdateEventMutation,
} = eventApi;
