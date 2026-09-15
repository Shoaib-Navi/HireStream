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
  }),
});

export const { useGetMeQuery, useLoginMutation, useRegisterMutation, useLogoutMutation } = authApi;
