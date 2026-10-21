import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const READ_METHODS = ["GET", "HEAD", "OPTIONS"];

// Browsers send Origin with every cross-site request that changes data, so one that isn't the app
// is a page elsewhere acting with the visitor's cookie. Requests without Origin aren't from a browser.
export const sameOriginWrites = (req, res, next) => {
  const origin = req.get("origin");
  if (READ_METHODS.includes(req.method) || !origin || env.clientUrls.includes(origin)) {
    return next();
  }
  next(ApiError.forbidden("Requests from this site are not allowed"));
};
