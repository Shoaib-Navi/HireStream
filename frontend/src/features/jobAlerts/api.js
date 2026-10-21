import { baseApi } from "@/services/api";

export const jobAlertsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getJobAlerts: build.query({
      query: () => ({ url: "/job-alerts" }),
      transformResponse: (response) => response.data.alerts,
      providesTags: ["JobAlerts"],
    }),
    createJobAlert: build.mutation({
      query: (body) => ({ url: "/job-alerts", method: "POST", body }),
      invalidatesTags: ["JobAlerts"],
    }),
    updateJobAlert: build.mutation({
      query: ({ id, ...body }) => ({ url: `/job-alerts/${id}`, method: "PATCH", body }),
      invalidatesTags: ["JobAlerts"],
    }),
    deleteJobAlert: build.mutation({
      query: (id) => ({ url: `/job-alerts/${id}`, method: "DELETE" }),
      invalidatesTags: ["JobAlerts"],
    }),
  }),
});

export const { useGetJobAlertsQuery, useCreateJobAlertMutation, useUpdateJobAlertMutation, useDeleteJobAlertMutation } =
  jobAlertsApi;
