import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";
import { MongoRateLimitStore } from "./rateLimitStore.js";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

const createLimiter = ({ windowMs, limit, message, skipSuccessfulRequests = false, store }) =>
  rateLimit({
    windowMs,
    store,
    limit,
    skipSuccessfulRequests,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => env.isTest,
    message: { success: false, message },
  });

// A broad flood guard counted per instance in memory, so ordinary requests don't pay for a database write.
// The limits below protect accounts and paid services, so they are shared across instances in MongoDB.
export const apiLimiter = createLimiter({
  windowMs: FIFTEEN_MINUTES,
  limit: 600,
  message: "Too many requests. Please try again later.",
});

export const loginLimiter = createLimiter({
  store: new MongoRateLimitStore("login"),
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many failed login attempts. Please try again in 15 minutes.",
});

export const registerLimiter = createLimiter({
  store: new MongoRateLimitStore("register"),
  windowMs: ONE_HOUR,
  limit: 10,
  message: "Too many accounts created from this network. Please try again later.",
});

export const emailLimiter = createLimiter({
  store: new MongoRateLimitStore("email"),
  windowMs: ONE_HOUR,
  limit: 5,
  message: "Too many emails requested. Please try again later.",
});

export const accountSecurityLimiter = createLimiter({
  store: new MongoRateLimitStore("account-security"),
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many attempts. Please try again in 15 minutes.",
});

export const aiLimiter = createLimiter({
  store: new MongoRateLimitStore("ai"),
  windowMs: 60 * 1000,
  limit: 10,
  message: "I'm getting too many requests. Please wait a moment and try again!",
});
