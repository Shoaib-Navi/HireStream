import { baseApi, unwrapWithMeta } from "@/services/api";

export const applicationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    applyToJob: build.mutation({
      query: ({ jobId, coverLetter }) => ({ url: `/jobs/${jobId}/applications`, method: "POST", body: { coverLetter } }),
      transformResponse: (response) => response.data.application,
      invalidatesTags: (result, error, { jobId }) => [{ type: "Job", id: jobId }, "MyApplications"],
    }),
    getMyApplications: build.query({
      query: (params) => ({ url: "/applications/mine", params }),
      transformResponse: unwrapWithMeta,
      providesTags: ["MyApplications"],
    }),
    getJobApplications: build.query({
      query: ({ jobId, ...params }) => ({ url: `/jobs/${jobId}/applications`, params }),
      transformResponse: unwrapWithMeta,
      providesTags: (result, error, { jobId }) => [{ type: "JobApplications", id: jobId }],
    }),
    updateApplicationStatus: build.mutation({
      query: ({ id, status, note }) => ({ url: `/applications/${id}/status`, method: "PATCH", body: { status, note } }),
      transformResponse: (response) => response.data.application,
      invalidatesTags: (result, error, { id, jobId }) => [
        { type: "JobApplications", id: jobId },
        { type: "Application", id },
      ],
    }),
  }),
});

export const {
  useApplyToJobMutation,
  useGetMyApplicationsQuery,
  useGetJobApplicationsQuery,
  useUpdateApplicationStatusMutation,
} = applicationsApi;
