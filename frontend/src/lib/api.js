import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Single HTTP client for the whole app: base URL + auth cookie on every request
const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
});

let handleUnauthorized = () => {};

// Registered once at startup (see main.jsx) to avoid a circular import with the store
export const setUnauthorizedHandler = (handler) => {
  handleUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  },
);

export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") =>
  error?.response?.data?.message || fallback;

export default api;
