import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;


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


export const emailLimiter = createLimiter({
  windowMs: ONE_HOUR,
  limit: 5,
  message: "Too many emails requested. Please try again later.",
});


export const accountSecurityLimiter = createLimiter({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many attempts. Please try again in 15 minutes.",
});

export const aiLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 10,
  message: "I'm getting too many requests. Please wait a moment and try again!",
});
