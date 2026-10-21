import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { USER_STATUS } from "../constants/index.js";
import { User } from "../modules/users/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { AUTH_COOKIE } from "../utils/cookies.js";

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const resolveUser = async (req) => {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return null;

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    // expired, tampered or malformed token
    return null;
  }
  if (typeof payload?.sub !== "string" || !OBJECT_ID_PATTERN.test(payload.sub)) return null;

  const user = await User.findById(payload.sub).select("role status emailVerifiedAt +tokenVersion");
  // tokenVersion changes when the password changes, which signs out every older session
  if (!user || user.tokenVersion !== payload.ver) return null;
  return user;
};

const attachUser = (req, user) => {
  req.user = {
    id: user._id.toString(),
    role: user.role,
    isEmailVerified: Boolean(user.emailVerifiedAt),
  };
};

export const authenticate = async (req, res, next) => {
  const user = await resolveUser(req);
  if (!user) {
    throw ApiError.unauthorized();
  }
  if (user.status === USER_STATUS.SUSPENDED) {
    throw ApiError.forbidden("Your account has been suspended. Please contact support.");
  }
  attachUser(req, user);
  next();
};

// Attaches the user when a valid session exists, but never rejects the request
export const optionalAuth = async (req, res, next) => {
  const user = await resolveUser(req);
  if (user && user.status !== USER_STATUS.SUSPENDED) {
    attachUser(req, user);
  }
  next();
};

// Must run after authenticate
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden();
    }
    next();
  };

// Enforced only when REQUIRE_EMAIL_VERIFICATION=true
export const requireVerifiedEmail = (req, res, next) => {
  if (env.requireEmailVerification && !req.user?.isEmailVerified) {
    throw ApiError.forbidden("Please verify your email address to continue");
  }
  next();
};
