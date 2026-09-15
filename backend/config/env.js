import dotenv from "dotenv";

dotenv.config();

const REQUIRED_VARS = ["MONGO_URI", "SECRET_KEY"];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

// Vercel always sets VERCEL=1, so treat it as production even if NODE_ENV is not set.
const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

const DEFAULT_CLIENT_URLS = [
  "http://localhost:5173",
  "https://hirestream-frontend-liard.vercel.app",
];

export const env = {
  isProduction,
  isVercel: Boolean(process.env.VERCEL),
  port: Number(process.env.PORT) || 8000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.SECRET_KEY,
  jwtExpiresIn: "1d",
  // CLIENT_URL may hold a comma-separated list of allowed frontend origins
  clientUrls: [...DEFAULT_CLIENT_URLS, ...(process.env.CLIENT_URL ?? "").split(",")]
    .map((url) => url.trim())
    .filter(Boolean),
  cloudinary: {
    cloudName: process.env.CLOUD_NAME,
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  },
};
