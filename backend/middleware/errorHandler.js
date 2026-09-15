import mongoose from "mongoose";
import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    success: false,
  });
};

// Express 5 forwards errors thrown in async handlers here automatically.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let status = 500;
  let message = "Something went wrong. Please try again later.";
  let details;

  if (err instanceof ApiError) {
    status = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 5 MB)" : err.message;
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err?.code === 11000) {
    status = 409;
    message = "A record with these details already exists";
  } else if (err?.type === "entity.parse.failed") {
    status = 400;
    message = "Request body is not valid JSON";
  } else if (err?.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large";
  }

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    message,
    success: false,
    ...(details && { errors: details }),
  });
};
