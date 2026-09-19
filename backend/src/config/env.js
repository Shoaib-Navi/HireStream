import dotenv from "dotenv";

dotenv.config({ quiet: true });

const toBoolean = (value, fallback = false) =>
  value === undefined || value === "" ? fallback : ["1", "true", "yes"].includes(value.toLowerCase());

const jwtSecret = process.env.JWT_SECRET || process.env.SECRET_KEY;

const missing = [];
if (!process.env.MONGO_URI) missing.push("MONGO_URI");
if (!jwtSecret) missing.push("JWT_SECRET");
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

// Vercel always sets VERCEL=1, so treat it as production even if NODE_ENV is not set.
const isVercel = Boolean(process.env.VERCEL);
const isProduction = process.env.NODE_ENV === "production" || isVercel;

// Public URL of the frontend, used for links in emails
const appUrl = (process.env.APP_URL || "http://localhost:5173").replace(/\/+$/, "");

export const env = {
  isProduction,
  isVercel,
  isTest: process.env.NODE_ENV === "test",
  port: Number(process.env.PORT) || 8010,
  mongoUri: process.env.MONGO_URI,
  jwtSecret,
  appUrl,
  // CLIENT_URL may hold extra allowed frontend origins, comma-separated
  clientUrls: [
    appUrl,
    "http://localhost:5173",
    "https://hirestream-frontend-liard.vercel.app",
    ...(process.env.CLIENT_URL ?? "").split(","),
  ]
    .map((url) => url.trim())
    .filter(Boolean),
  requireEmailVerification: toBoolean(process.env.REQUIRE_EMAIL_VERIFICATION),
  cloudinary: {
    cloudName: process.env.CLOUD_NAME,
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || "hirestream",
  },
  // Without SMTP_HOST, emails are printed to the console in development and skipped in production
  email: {
    from: process.env.EMAIL_FROM || "HireStream <no-reply@hirestream.dev>",
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: toBoolean(process.env.SMTP_SECURE),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  },
};
