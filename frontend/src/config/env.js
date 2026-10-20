// Without VITE_API_URL a production build calls its own origin, where vercel.json forwards /api to the backend
const apiOrigin = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8010" : "")).replace(/\/+$/, "");

export const API_BASE_URL = `${apiOrigin}/api/v1`;

export const APP_NAME = "HireStream";

export const GITHUB_URL = "https://github.com/Shoaib-Navi/HireStream";
