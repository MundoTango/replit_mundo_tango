// Need to use the React-specific entry point to import createApi
"use client";
import {
  CHANGE_PASSWORD,
  DELETE_ACC,
  FORGOT_OTP,
  LOGIN,
  LOGOUT,
  ROOT,
  SEND_OTP,
  SET_NEW_PASSWORD,
  SOCIAL_LOGIN,
  VERIFY_OTP,
} from "@/utils/API_URL";
import { baseApi } from "./baseApi";
import { getAuthToken } from "./localStorageService";

export const userAuthApi = baseApi.injectEndpoints({
  credentials: "include",
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (user) => {
        return {
          url: ROOT,
          method: "POST",
          body: user,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    loginUser: builder.mutation({
      query: (user) => {
        return {
          url: LOGIN,
          method: "POST",
          body: user,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    socialLogin: builder.mutation({
      query: (user) => {
        return {
          url: SOCIAL_LOGIN,
          method: "POST",
          body: user,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    forgotPassword: builder.mutation({
      query: (body) => {
        return {
          url: SEND_OTP,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      // keepUnusedDataFor: 0,
      // refetchOnFocus: true,
    }),
    getMyProfile: builder.mutation({
      query: (user) => {
        return {
          url: ROOT,
          method: "GET",
          body: user,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      keepUnusedDataFor: 0,
      refetchOnFocus: true,
    }),
    logout: builder.mutation({
      query: (user) => {
        return {
          url: LOGOUT,
          method: "POST",
          body: {},
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
    }),
    verifyOtp: builder.mutation({
      query: (body) => {
        return {
          url: VERIFY_OTP,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
    }),
    forgotOtp: builder.mutation({
      query: (body) => {
        return {
          url: FORGOT_OTP,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
    }),
    setNewPassword: builder.mutation({
      query: (body) => {
        return {
          url: SET_NEW_PASSWORD,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
    }),
    getMyProfile2: builder.mutation({
      query: (user) => {
        return {
          url: ROOT,
          method: "GET",
          body: user,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: getAuthToken(),
          },
        };
      },
    }),
    deleteAcc: builder.mutation({
      query: (user) => {
        return {
          url: DELETE_ACC,
          method: "DELETE",
          body: {},
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
    }),
    changePassword: builder.mutation({
      query: (body) => {
        return {
          url: CHANGE_PASSWORD,
          method: "POST",
          body,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
    }),
  }),
});

export const {
  useLoginUserMutation,
  useSocialLoginMutation,
  useForgotPasswordMutation,
  useRegisterUserMutation,
  useGetMyProfileMutation,
  useLogoutMutation,
  useVerifyOtpMutation,
  useForgotOtpMutation,
  useSetNewPasswordMutation,
  useGetMyProfile2Mutation,
  useDeleteAccMutation,
  useChangePasswordMutation,
} = userAuthApi;
