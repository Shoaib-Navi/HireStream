import { baseApi, unwrapData, USER_SCOPED_TAGS } from "@/services/api";
import { loggedOut } from "./authActions";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query({
      query: () => ({ url: "/auth/me" }),
      transformResponse: unwrapData,
      providesTags: ["Me"],
    }),
    login: build.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: unwrapData,
      invalidatesTags: USER_SCOPED_TAGS,
    }),
    register: build.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      transformResponse: unwrapData,
      invalidatesTags: USER_SCOPED_TAGS,
    }),
    logout: build.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // sign out locally even if the request failed
        } finally {
          dispatch(loggedOut());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
    verifyEmail: build.mutation({
      query: (token) => ({ url: "/auth/verify-email", method: "POST", body: { token } }),
      transformResponse: unwrapData,
      // refreshes the signed-in user, if any, so verification notices disappear
      invalidatesTags: ["Me"],
    }),
    resendVerification: build.mutation({
      query: () => ({ url: "/auth/verify-email/resend", method: "POST" }),
    }),
    forgotPassword: build.mutation({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: build.mutation({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // every session was signed out, including this one
          dispatch(loggedOut());
          dispatch(baseApi.util.resetApiState());
        } catch {
          // the page shows the error
        }
      },
    }),
    changePassword: build.mutation({
      query: (body) => ({ url: "/auth/password", method: "PATCH", body }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
