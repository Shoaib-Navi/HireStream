import { rateLimit } from "express-rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const limitMessage = (message) => ({ message, success: false });

// Note: the default store is in-memory, so on serverless each instance counts separately.
// Use a shared store (e.g. Redis) if stronger guarantees are needed.
export const apiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: limitMessage("Too many requests. Please try again later."),
});

// Only failed attempts count, so real users are not locked out after logging in normally
export const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: limitMessage("Too many failed login attempts. Please try again in 15 minutes."),
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: limitMessage("Too many accounts created from this network. Please try again later."),
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: limitMessage("I'm getting too many requests. Please wait a moment and try again!"),
});
