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
    getApplication: build.query({
      query: (id) => ({ url: `/applications/${id}` }),
      transformResponse: (response) => response.data.application,
      providesTags: (result, error, id) => [{ type: "Application", id }],
    }),
    withdrawApplication: build.mutation({
      query: (id) => ({ url: `/applications/${id}/withdraw`, method: "PATCH" }),
      transformResponse: (response) => response.data.application,
      invalidatesTags: (result, error, id) => ["MyApplications", { type: "Application", id }],
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
        "RecruiterOverview",
      ],
    }),
    addApplicationNote: build.mutation({
      query: ({ id, body }) => ({ url: `/applications/${id}/notes`, method: "POST", body: { body } }),
      transformResponse: (response) => response.data.notes,
      invalidatesTags: (result, error, { id }) => [{ type: "Application", id }],
    }),
  }),
});

export const {
  useApplyToJobMutation,
  useGetMyApplicationsQuery,
  useGetApplicationQuery,
  useWithdrawApplicationMutation,
  useGetJobApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useAddApplicationNoteMutation,
} = applicationsApi;
