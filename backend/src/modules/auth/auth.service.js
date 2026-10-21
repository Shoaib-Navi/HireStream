import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { ROLES, SESSION_DAYS, USER_STATUS } from "../../constants/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { CandidateProfile } from "../users/candidateProfile.model.js";
import { User } from "../users/user.model.js";

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
