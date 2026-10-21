import { toFileFormData } from "@/lib/formData";
import { baseApi } from "@/services/api";

const companyTags = (id) => ["RecruiterCompanies", { type: "Company", id }, { type: "Job", id: "LIST" }];

export const companiesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyCompanies: build.query({
      query: () => ({ url: "/companies/mine" }),
      transformResponse: (response) => response.data.companies,
      providesTags: ["RecruiterCompanies"],
    }),
    getMyCompany: build.query({
      query: (id) => ({ url: `/companies/mine/${id}` }),
      transformResponse: (response) => response.data.company,
      providesTags: (result, error, id) => [{ type: "Company", id }],
    }),
    createCompany: build.mutation({
      query: (body) => ({ url: "/companies", method: "POST", body }),
      transformResponse: (response) => response.data.company,
      invalidatesTags: ["RecruiterCompanies"],
    }),
    updateCompany: build.mutation({
      query: ({ id, ...body }) => ({ url: `/companies/${id}`, method: "PATCH", body }),
      transformResponse: (response) => response.data.company,
      invalidatesTags: (result, error, { id }) => companyTags(id),
    }),
    uploadCompanyLogo: build.mutation({
      query: ({ id, file }) => ({ url: `/companies/${id}/logo`, method: "PUT", body: toFileFormData(file) }),
      transformResponse: (response) => response.data.company,
      invalidatesTags: (result, error, { id }) => companyTags(id),
    }),
  }),
});

export const {
  useGetMyCompaniesQuery,
  useGetMyCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useUploadCompanyLogoMutation,
} = companiesApi;
