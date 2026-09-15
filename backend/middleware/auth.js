import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";

const getUserIdFromToken = (req) => {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    return jwt.verify(token, env.jwtSecret).userId ?? null;
  } catch {
    // expired, tampered or malformed token
    return null;
  }
};

// Loads the user so role checks use the current database value, and deleted accounts lose access.
const loadUser = async (req) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return null;
  const user = await User.findById(userId).select("_id role");
  if (!user) return null;
  req.id = user._id.toString();
  req.role = user.role;
  return user;
};

export const isAuthenticated = async (req, res, next) => {
  const user = await loadUser(req);
  if (!user) {
    throw new ApiError(401, "Please log in to continue");
  }
  next();
};

// Attaches the user when a valid token is present, but never rejects the request.
export const optionalAuth = async (req, res, next) => {
  await loadUser(req);
  next();
};

// Must run after isAuthenticated.
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.role)) {
      throw new ApiError(403, "You don't have permission to perform this action");
    }
    next();
  };
