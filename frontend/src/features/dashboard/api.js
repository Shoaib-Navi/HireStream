import { baseApi, unwrapData } from "@/services/api";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRecruiterOverview: build.query({
      query: () => ({ url: "/dashboard/recruiter" }),
      transformResponse: unwrapData,
      providesTags: ["RecruiterOverview"],
    }),
  }),
});

export const { useGetRecruiterOverviewQuery } = dashboardApi;
