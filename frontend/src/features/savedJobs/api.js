import { baseApi, unwrapWithMeta } from "@/services/api";

// Saving changes the job's isSaved flag, so the job lists and details that show it refetch
const savedJobTags = (jobId) => ["SavedJobs", { type: "Job", id: jobId }];

export const savedJobsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSavedJobs: build.query({
      query: (params) => ({ url: "/saved-jobs", params }),
      transformResponse: unwrapWithMeta,
      providesTags: ["SavedJobs"],
    }),
    saveJob: build.mutation({
      query: (jobId) => ({ url: `/saved-jobs/${jobId}`, method: "PUT" }),
      invalidatesTags: (result, error, jobId) => savedJobTags(jobId),
    }),
    unsaveJob: build.mutation({
      query: (jobId) => ({ url: `/saved-jobs/${jobId}`, method: "DELETE" }),
      invalidatesTags: (result, error, jobId) => savedJobTags(jobId),
    }),
  }),
});

export const { useGetSavedJobsQuery, useSaveJobMutation, useUnsaveJobMutation } = savedJobsApi;
