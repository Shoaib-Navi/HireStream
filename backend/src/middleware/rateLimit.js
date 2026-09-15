import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

// Note: the default store is in-memory, so on serverless each instance counts separately.
const createLimiter = ({ windowMs, limit, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => env.isTest,
    message: { success: false, message },
  });

export const apiLimiter = createLimiter({
  windowMs: FIFTEEN_MINUTES,
  limit: 600,
  message: "Too many requests. Please try again later.",
});

// Only failed attempts count, so real users are not locked out after logging in normally
export const loginLimiter = createLimiter({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many failed login attempts. Please try again in 15 minutes.",
});

export const registerLimiter = createLimiter({
  windowMs: ONE_HOUR,
  limit: 10,
  message: "Too many accounts created from this network. Please try again later.",
});

export const aiLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 10,
  message: "I'm getting too many requests. Please wait a moment and try again!",
});
