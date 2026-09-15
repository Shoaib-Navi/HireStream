import { baseApi, unwrapWithMeta } from "@/services/api";

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
      invalidatesTags: ["RecruiterJobs", "RecruiterCompanies", { type: "Job", id: "LIST" }],
    }),
  }),
});

export const { useGetJobsQuery, useGetJobQuery, useGetRecruiterJobsQuery, useCreateJobMutation } = jobsApi;
