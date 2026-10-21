import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import {
  EMAIL_VERIFICATION_HOURS,
  PASSWORD_RESET_MINUTES,
  ROLES,
  SESSION_DAYS,
  TOKEN_PURPOSE,
  USER_STATUS,
} from "../../constants/index.js";
import { sendEmail } from "../../services/email.js";
import { ApiError } from "../../utils/ApiError.js";
import { CandidateProfile } from "../users/candidateProfile.model.js";
import { User } from "../users/user.model.js";
import { passwordResetEmail, verificationEmail } from "./auth.emails.js";
import { consumeToken, issueToken } from "./authTokens.js";

const BCRYPT_ROUNDS = 12;

let dummyHashPromise = null;
// Comparing against a dummy hash when the email is unknown keeps response times similar,
// so attackers can't tell which emails have accounts
const getDummyHash = () => {
  dummyHashPromise ??= bcrypt.hash("dummy-password-for-timing", BCRYPT_ROUNDS);
  return dummyHashPromise;
};

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS);

export const createSessionToken = (user) =>
  jwt.sign({ sub: user._id.toString(), ver: user.tokenVersion ?? 0 }, env.jwtSecret, {
    expiresIn: `${SESSION_DAYS}d`,
  });

const sendVerificationEmail = async (user) => {
  const token = await issueToken(user._id, TOKEN_PURPOSE.EMAIL_VERIFICATION, EMAIL_VERIFICATION_HOURS * 60 * 60 * 1000);
  await sendEmail(verificationEmail(user, token, EMAIL_VERIFICATION_HOURS));
};

export const registerUser = async ({ fullName, email, phone, password, role }) => {
  const emailTaken = await User.exists({ email });
  if (emailTaken) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const user = await User.create({
    fullName,
    email,
    phone,
    role,
    password: await hashPassword(password),
  });

  if (role === ROLES.CANDIDATE) {
    await CandidateProfile.create({ user: user._id });
  }
  await sendVerificationEmail(user);
  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password +tokenVersion");
  const passwordMatches = await bcrypt.compare(password, user?.password ?? (await getDummyHash()));

  if (!user || !passwordMatches) {
    throw ApiError.unauthorized("Incorrect email or password");
  }
  if (user.status === USER_STATUS.SUSPENDED) {
    throw ApiError.forbidden("Your account has been suspended. Please contact support.");
  }

  user.lastLoginAt = new Date();
  await User.updateOne({ _id: user._id }, { lastLoginAt: user.lastLoginAt });
  return user;
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return user;
};

export const resendVerificationEmail = async (userId) => {
  const user = await getCurrentUser(userId);
  if (user.emailVerifiedAt) {
    throw ApiError.badRequest("Your email is already verified");
  }
  await sendVerificationEmail(user);
};

export const verifyEmail = async (token) => {
  const record = await consumeToken(token, TOKEN_PURPOSE.EMAIL_VERIFICATION);
  const user = record && (await User.findById(record.user));
  if (!user) {
    throw ApiError.badRequest("This verification link is invalid or has expired");
  }

  if (!user.emailVerifiedAt) {
    user.emailVerifiedAt = new Date();
    await user.save();
  }
  return user;
};

// Always succeeds, so the response doesn't reveal whether an account exists
export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email, status: USER_STATUS.ACTIVE });
  if (!user) return;

  const token = await issueToken(user._id, TOKEN_PURPOSE.PASSWORD_RESET, PASSWORD_RESET_MINUTES * 60 * 1000);
  await sendEmail(passwordResetEmail(user, token, PASSWORD_RESET_MINUTES));
};

// Signs out every existing session. Opening the emailed link also proves the user owns the address.
export const resetPassword = async ({ token, password }) => {
  const record = await consumeToken(token, TOKEN_PURPOSE.PASSWORD_RESET);
  const user = record && (await User.findById(record.user));
  if (!user) {
    throw ApiError.badRequest("This reset link is invalid or has expired");
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: { password: await hashPassword(password), emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
      $inc: { tokenVersion: 1 },
    },
  );
};

// Signs out other sessions; the caller issues a fresh cookie for the current one
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    throw ApiError.badRequest("Your current password is incorrect", [
      { field: "currentPassword", message: "Your current password is incorrect" },
    ]);
  }
  if (currentPassword === newPassword) {
    throw ApiError.badRequest("Choose a password you haven't used here before", [
      { field: "newPassword", message: "New password must be different from the current one" },
    ]);
  }

  return User.findByIdAndUpdate(
    userId,
    { $set: { password: await hashPassword(newPassword) }, $inc: { tokenVersion: 1 } },
    { new: true },
  ).select("+tokenVersion");
};
