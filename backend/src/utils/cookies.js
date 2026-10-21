import { env } from "../config/env.js";
import { SESSION_DAYS } from "../constants/index.js";

export const AUTH_COOKIE = "token";

// Production frontend and backend live on different domains, which requires SameSite=None + Secure.
// Locally both run on localhost (same site), so Lax over plain http works.
const baseCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  path: "/",
};

export const setAuthCookie = (res, token) =>
  res.cookie(AUTH_COOKIE, token, { ...baseCookieOptions, maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000 });

export const clearAuthCookie = (res) => res.clearCookie(AUTH_COOKIE, baseCookieOptions);
