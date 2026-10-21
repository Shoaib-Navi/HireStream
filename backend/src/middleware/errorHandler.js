import mongoose from "mongoose";
import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const DUPLICATE_KEY_MESSAGES = {
  email: "An account with this email already exists",
  slug: "Something with this name already exists. Please try again.",
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};


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
    const field = Object.keys(err.keyPattern ?? {})[0];
    message = DUPLICATE_KEY_MESSAGES[field] ?? "A record with these details already exists";
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
    success: false,
    message,
    ...(details && { errors: details }),
  });
};
