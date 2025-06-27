import {
  ADD_EXPERIENCE,
  CREATOR_EXPERIENCE,
  DJ_EXPERIENCE,
  GET_ACTIVITIES,
  GET_CREATOR_EXPERIENCE,
  GET_DJ_EXPERIENCE,
  GET_EXPERIENCE,
  GET_HOST_EXPERIENCE,
  GET_LEARNING_SOURCE,
  GET_ORGANIZAR_EXPERIENCE,
  GET_PERFORMER_EXPERIENCE,
  GET_PHOTOGRAPHER_EXPERIENCE,
  GET_TEACHER_EXPERIENCE,
  GET_TOUR_OPERATOR,
  GET_USER_QUESTION,
  LEARNING_SOURCE,
  ORGANIZAR_EXPERIENCE,
  PERFORMER_EXPERIENCE,
  PHOTOGRAPHER_EXPERIENCE,
  STORE_ACTIVITIES,
  TEACHER_EXPERIENCE,
  TOUR_OPERATOR,
  USER_QUESTIONS,
  HOST_EXPERIENCE,
  ATTACHMENT_HOST_EXPERIENCE,
  GET_LANGUAGES,
  CODE_OF_CONDUCT,
} from "@/utils/API_URL";
import { baseApi } from "./baseApi";
import { getAuthToken } from "./localStorageService";

export const userFormsApi = baseApi.injectEndpoints({
  reducerPath: "userFormsApi",
  endpoints: (builder) => ({
    userQuestions: builder.mutation({
      query: (body) => {
        return {
          url: USER_QUESTIONS,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    getUserQuestion: builder.mutation({
      query: (body) => {
        return {
          url: GET_USER_QUESTION,
          method: "GET",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    storeTrangoActivity: builder.mutation({
      query: (body) => {
        return {
          url: STORE_ACTIVITIES,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    getTrangoActivity: builder.mutation({
      query: (body) => {
        return {
          url: GET_ACTIVITIES,
          method: "GET",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    addDanceExperience: builder.mutation({
      query: (payload) => {
        return {
          url: ADD_EXPERIENCE,
          method: "POST",
          body: payload,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    getDanceExperience: builder.query({
      query: () => {
        return {
          url: GET_EXPERIENCE,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },

      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    addTeacherExperience: builder.mutation({
      query: (body) => {
        return {
          url: TEACHER_EXPERIENCE,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    getTeacherExperience: builder.mutation({
      query: (body) => {
        return {
          url: GET_TEACHER_EXPERIENCE,
          method: "GET",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    addOrganizerExperience: builder.mutation({
      query: (body) => {
        return {
          url: ORGANIZAR_EXPERIENCE,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    getOrganizerExperience: builder.mutation({
      query: (body) => {
        return {
          url: GET_ORGANIZAR_EXPERIENCE,
          method: "GET",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    addDjExperience: builder.mutation({
      query: (body) => {
        return {
          url: DJ_EXPERIENCE,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    getDjExperience: builder.mutation({
      query: (body) => {
        return {
          url: GET_DJ_EXPERIENCE,
          method: "GET",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    addCreatorExperience: builder.mutation({
      query: (body) => {
        return {
          url: CREATOR_EXPERIENCE,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    getCreatorExperience: builder.mutation({
      query: (body) => {
        return {
          url: GET_CREATOR_EXPERIENCE,
          method: "GET",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    addPhotographerExperience: builder.mutation({
      query: (body) => {
        return {
          url: PHOTOGRAPHER_EXPERIENCE,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    getPhotographerExperience: builder.mutation({
      query: (body) => {
        return {
          url: GET_PHOTOGRAPHER_EXPERIENCE,
          method: "GET",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    addPerformExperience: builder.mutation({
      query: (body) => {
        return {
          url: PERFORMER_EXPERIENCE,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    getPerformExperience: builder.mutation({
      query: (body) => {
        return {
          url: GET_PERFORMER_EXPERIENCE,
          method: "GET",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    addLearningSource: builder.mutation({
      query: (sections) => {
        return {
          url: LEARNING_SOURCE,
          method: "POST",
          body: sections,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    getLearningSource: builder.query({
      query: () => {
        return {
          url: GET_LEARNING_SOURCE,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    addHostExperience: builder.mutation({
      query: (body) => {
        return {
          url: HOST_EXPERIENCE,
          method: "POST",
          body,
          headers: {
            // "Content-type": "multipart/form-data;",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    getHostExperience: builder.mutation({
      query: () => {
        return {
          url: GET_HOST_EXPERIENCE,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },

      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    addTourHostExperience: builder.mutation({
      query: (body) => {
        return {
          url: TOUR_OPERATOR,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    getTourHostExperience: builder.mutation({
      query: () => {
        return {
          url: GET_TOUR_OPERATOR,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },

      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    addAttachmentHostExperience: builder.mutation({
      query: (body) => {
        return {
          url: ATTACHMENT_HOST_EXPERIENCE,
          method: "POST",
          body,
          headers: {
            // "Content-type": "multipart/form-data;",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    getLanguages: builder.query({
      query: () => {
        return {
          url: GET_LANGUAGES,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    getReviewDetails: builder.query({
      query: (id) => {
        console.log("getaboutdetail", id);
        return {
          url: `/user/get-user-about/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    addCodeOfConduct: builder.mutation({
      query: (body) => {
        return {
          url: CODE_OF_CONDUCT,
          method: "POST",
          body,
          headers: {
            // "Content-type": "multipart/form-data;",
            authorization: getAuthToken(),
          },
        };
      },
    }),
  }),
});

export const {
  useUserQuestionsMutation,
  useGetUserQuestionMutation,
  useAddDanceExperienceMutation,
  useGetDanceExperienceQuery,
  useStoreTrangoActivityMutation,
  useGetTrangoActivityMutation,
  useAddTeacherExperienceMutation,
  useGetTeacherExperienceMutation,
  useAddOrganizerExperienceMutation,
  useGetOrganizerExperienceMutation,
  useAddDjExperienceMutation,
  useGetDjExperienceMutation,
  useAddCreatorExperienceMutation,
  useGetCreatorExperienceMutation,
  useAddPhotographerExperienceMutation,
  useGetPhotographerExperienceMutation,
  useAddPerformExperienceMutation,
  useGetPerformExperienceMutation,
  useAddLearningSourceMutation,
  useGetLearningSourceQuery,
  useAddHostExperienceMutation,
  useGetHostExperienceMutation,
  useAddTourHostExperienceMutation,
  useGetTourHostExperienceMutation,
  useAddAttachmentHostExperienceMutation,
  useGetLanguagesQuery,
  useGetReviewDetailsQuery,
  useAddCodeOfConductMutation,
} = userFormsApi;
