import { env } from "../config/env.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Production frontend and backend live on different domains, which requires SameSite=None + Secure.
// Locally both run on localhost (same site), so Lax over plain http works.
const baseCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  path: "/",
};

export const setAuthCookie = (res, token) =>
  res.cookie("token", token, { ...baseCookieOptions, maxAge: ONE_DAY_MS });

export const clearAuthCookie = (res) => res.clearCookie("token", baseCookieOptions);
