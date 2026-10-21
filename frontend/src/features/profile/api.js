import { userUpdated } from "@/features/auth/authSlice";
import { toFileFormData } from "@/lib/formData";
import { baseApi, unwrapData } from "@/services/api";

// Write the returned profile into the cache instead of refetching it
const updateProfileCache = async (_, { dispatch, queryFulfilled }) => {
  try {
    const { data: profile } = await queryFulfilled;
    dispatch(profileApi.util.upsertQueryData("getMyProfile", undefined, profile));
  } catch {
    // the component that triggered the request shows the error
  }
};

// Keep the signed-in user in the auth state in sync (navbar avatar, name)
const updateStoredUser = async (_, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(userUpdated(data.user));
  } catch {
    // the component that triggered the request shows the error
  }
};

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyProfile: build.query({
      query: () => ({ url: "/users/me/profile" }),
      transformResponse: (response) => response.data.profile,
      providesTags: ["Profile"],
    }),
    updateMyProfile: build.mutation({
      query: (body) => ({ url: "/users/me/profile", method: "PATCH", body }),
      transformResponse: (response) => response.data.profile,
      onQueryStarted: updateProfileCache,
    }),
    uploadResume: build.mutation({
      query: (file) => ({ url: "/users/me/resume", method: "PUT", body: toFileFormData(file) }),
      transformResponse: (response) => response.data.profile,
      onQueryStarted: updateProfileCache,
    }),
    removeResume: build.mutation({
      query: () => ({ url: "/users/me/resume", method: "DELETE" }),
      transformResponse: (response) => response.data.profile,
      onQueryStarted: updateProfileCache,
    }),
    updateAccount: build.mutation({
      query: (body) => ({ url: "/users/me", method: "PATCH", body }),
      transformResponse: unwrapData,
      onQueryStarted: updateStoredUser,
    }),
    uploadAvatar: build.mutation({
      query: (file) => ({ url: "/users/me/avatar", method: "PUT", body: toFileFormData(file) }),
      transformResponse: unwrapData,
      onQueryStarted: updateStoredUser,
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useUploadResumeMutation,
  useRemoveResumeMutation,
  useUpdateAccountMutation,
  useUploadAvatarMutation,
} = profileApi;
