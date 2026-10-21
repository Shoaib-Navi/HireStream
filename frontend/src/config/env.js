const apiOrigin = (import.meta.env.VITE_API_URL || "http://localhost:8010").replace(/\/+$/, "");

export const API_BASE_URL = `${apiOrigin}/api/v1`;

export const APP_NAME = "HireStream";

export const GITHUB_URL = "https://github.com/Shoaib-Navi/HireStream";
