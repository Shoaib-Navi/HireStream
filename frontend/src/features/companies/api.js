import { toFileFormData } from "@/lib/formData";
import { baseApi, unwrapWithMeta } from "@/services/api";

const companyTags = (id) => [
  "RecruiterCompanies",
  { type: "Company", id },
  { type: "Company", id: "LIST" },
  { type: "Job", id: "LIST" },
];

export const companiesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Public directory and company pages
    getCompanies: build.query({
      query: (params) => ({ url: "/companies", params }),
      transformResponse: unwrapWithMeta,
      providesTags: [{ type: "Company", id: "LIST" }],
    }),
    getCompanyBySlug: build.query({
      query: (slug) => ({ url: `/companies/${slug}` }),
      transformResponse: (response) => response.data.company,
      providesTags: (result) => (result ? [{ type: "Company", id: result._id }] : []),
    }),

    // Recruiter's own companies
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
      invalidatesTags: ["RecruiterCompanies", { type: "Company", id: "LIST" }],
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
  useGetCompaniesQuery,
  useGetCompanyBySlugQuery,
  useGetMyCompaniesQuery,
  useGetMyCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useUploadCompanyLogoMutation,
} = companiesApi;
