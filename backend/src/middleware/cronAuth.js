import { timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

// Scheduled endpoints: Vercel Cron calls them with "Authorization: Bearer <CRON_SECRET>".
// Without a configured secret they stay closed.
export const requireCronSecret = (req, res, next) => {
  const expected = Buffer.from(`Bearer ${env.cronSecret ?? ""}`);
  const received = Buffer.from(req.get("authorization") ?? "");

  if (!env.cronSecret || expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return next(ApiError.unauthorized("Not allowed"));
  }
  next();
};
