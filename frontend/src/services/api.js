import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { sessionExpired } from "@/features/auth/authActions";

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  // ?workMode=remote&workMode=hybrid (the API also accepts comma-separated values)
  paramsSerializer: { indexes: null },
});

const NETWORK_ERROR_MESSAGE = "Can't reach the server. Please check your connection and try again.";
const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

// Every failure becomes { status, message, errors } so components handle errors one way
const toApiError = (error) => {
  if (!error.response) {
    return { status: "FETCH_ERROR", message: NETWORK_ERROR_MESSAGE, errors: [] };
  }
  const { status, data } = error.response;
  return { status, message: data?.message || GENERIC_ERROR_MESSAGE, errors: data?.errors ?? [] };
};

const axiosBaseQuery = async ({ url, method = "GET", body, params }, api) => {
  try {
    const response = await httpClient.request({ url, method, data: body, params, signal: api.signal });
    return { data: response.data };
  } catch (error) {
    if (axios.isCancel(error)) {
      return { error: { status: "CANCELLED", message: "Request cancelled", errors: [] } };
    }
    const apiError = toApiError(error);
    // the session cookie is missing or expired: drop the stored user
    if (apiError.status === 401) {
      api.dispatch(sessionExpired());
    }
    return { error: apiError };
  }
};

// Feature modules add their endpoints with baseApi.injectEndpoints (see features/*/api.js)
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery,
  tagTypes: [
    "Me",
    "Profile",
    "Job",
    "RecruiterJobs",
    "RecruiterCompanies",
    "Company",
    "MyApplications",
    "JobApplications",
    "Application",
    "SavedJobs",
    "RecruiterOverview",
    "Notifications",
  ],
  endpoints: () => ({}),
});

// Responses look like { success, message, data, meta }
export const unwrapData = (response) => response.data;
export const unwrapWithMeta = (response) => ({ ...response.data, meta: response.meta });

// Tags that depend on who is logged in
export const USER_SCOPED_TAGS = ["Me", "Profile", "Job", "RecruiterJobs", "RecruiterCompanies", "MyApplications", "JobApplications", "Application", "Notifications"];
