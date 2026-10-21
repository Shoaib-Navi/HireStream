import { baseApi, unwrapWithMeta } from "@/services/api";

// Anything that changes a recruiter's jobs affects their lists, company job counts and overview
const recruiterJobTags = (id) => [
  "RecruiterJobs",
  "RecruiterCompanies",
  "RecruiterOverview",
  { type: "Job", id: "LIST" },
  ...(id ? [{ type: "Job", id }] : []),
];

export const jobsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getJobs: build.query({
      query: (params) => ({ url: "/jobs", params }),
      transformResponse: unwrapWithMeta,
      providesTags: (result) => [
        ...(result?.jobs ?? []).map((job) => ({ type: "Job", id: job._id })),
        { type: "Job", id: "LIST" },
      ],
    }),
    getJob: build.query({
      query: (id) => ({ url: `/jobs/${id}` }),
      transformResponse: (response) => response.data.job,
      providesTags: (result, error, id) => [{ type: "Job", id }],
    }),
    getRecruiterJobs: build.query({
      query: (params) => ({ url: "/jobs/mine", params }),
      transformResponse: unwrapWithMeta,
      providesTags: ["RecruiterJobs"],
    }),
    createJob: build.mutation({
      query: (body) => ({ url: "/jobs", method: "POST", body }),
      transformResponse: (response) => response.data.job,
      invalidatesTags: () => recruiterJobTags(),
    }),
    updateJob: build.mutation({
      query: ({ id, ...body }) => ({ url: `/jobs/${id}`, method: "PATCH", body }),
      transformResponse: (response) => response.data.job,
      invalidatesTags: (result, error, { id }) => recruiterJobTags(id),
    }),
    updateJobStatus: build.mutation({
      query: ({ id, status }) => ({ url: `/jobs/${id}/status`, method: "PATCH", body: { status } }),
      transformResponse: (response) => response.data.job,
      invalidatesTags: (result, error, { id }) => recruiterJobTags(id),
    }),
    deleteJob: build.mutation({
      query: (id) => ({ url: `/jobs/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [...recruiterJobTags(id), "SavedJobs"],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetJobQuery,
  useGetRecruiterJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useUpdateJobStatusMutation,
  useDeleteJobMutation,
} = jobsApi;
