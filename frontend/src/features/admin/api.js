import { baseApi, unwrapWithMeta } from "@/services/api";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminOverview: build.query({
      query: () => ({ url: "/admin/overview" }),
      transformResponse: (response) => response.data,
      providesTags: ["AdminOverview"],
    }),
    getAdminUsers: build.query({
      query: (params) => ({ url: "/admin/users", params }),
      transformResponse: unwrapWithMeta,
      providesTags: ["AdminUsers"],
    }),
    updateUserStatus: build.mutation({
      query: ({ id, status }) => ({ url: `/admin/users/${id}/status`, method: "PATCH", body: { status } }),
      transformResponse: (response) => response.data.user,
      invalidatesTags: ["AdminUsers", "AdminOverview"],
    }),
    getAdminCompanies: build.query({
      query: (params) => ({ url: "/admin/companies", params }),
      transformResponse: unwrapWithMeta,
      providesTags: ["AdminCompanies"],
    }),
    updateAdminCompany: build.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/companies/${id}`, method: "PATCH", body }),
      transformResponse: (response) => response.data.company,
      invalidatesTags: ["AdminCompanies", "AdminOverview", { type: "Job", id: "LIST" }],
    }),
    getAdminJobs: build.query({
      query: (params) => ({ url: "/admin/jobs", params }),
      transformResponse: unwrapWithMeta,
      providesTags: ["AdminJobs"],
    }),
    updateAdminJobStatus: build.mutation({
      query: ({ id, status }) => ({ url: `/admin/jobs/${id}/status`, method: "PATCH", body: { status } }),
      transformResponse: (response) => response.data.job,
      invalidatesTags: ["AdminJobs", "AdminOverview", { type: "Job", id: "LIST" }],
    }),
    deleteAdminJob: build.mutation({
      query: (id) => ({ url: `/admin/jobs/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminJobs", "AdminOverview", { type: "Job", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAdminOverviewQuery,
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
  useGetAdminCompaniesQuery,
  useUpdateAdminCompanyMutation,
  useGetAdminJobsQuery,
  useUpdateAdminJobStatusMutation,
  useDeleteAdminJobMutation,
} = adminApi;
