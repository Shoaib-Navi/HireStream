import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { clearAuthCookie, setAuthCookie } from "../utils/cookies.js";

export const register = async (req, res) => {
  const { fullname, email, phoneNumber, password, role } = req.body;

  const userExists = await User.exists({ email });
  if (userExists) {
    throw new ApiError(409, "User already exist with this email.");
  }

  // Profile photo is optional. Upload only after the checks pass so rejected signups leave no files behind.
  const profilePhoto = req.file ? await uploadToCloudinary(req.file) : "";
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    fullname,
    email,
    phoneNumber,
    password: hashedPassword,
    role,
    profile: { profilePhoto },
  });

  return res.status(201).json({
    message: "Account created successfully",
    success: true,
  });
};

export const login = async (req, res) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email }).select("+password");
  // Same message for unknown email and wrong password, so emails can't be probed
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Incorrect email or password");
  }
  if (role !== user.role) {
    throw new ApiError(403, "Account doesn't exist with current role.");
  }

  const token = jwt.sign({ userId: user._id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  setAuthCookie(res, token);

  return res.status(200).json({
    message: `Welcome back ${user.fullname}`,
    user: user.toJSON(),
    success: true,
  });
};

export const logout = async (req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({
    message: "Logged out successfully",
    success: true,
  });
};

// Lets the frontend confirm the cookie session is still valid and refresh the stored user
export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.status(200).json({
    user,
    success: true,
  });
};

export const updateProfile = async (req, res) => {
  const { fullname, email, phoneNumber, bio, skills } = req.body;

  const user = await User.findById(req.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (email && email !== user.email) {
    const emailTaken = await User.exists({ email, _id: { $ne: user._id } });
    if (emailTaken) {
      throw new ApiError(409, "Another account already uses this email.");
    }
    user.email = email;
  }
  if (fullname) user.fullname = fullname;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (bio !== undefined) user.profile.bio = bio;
  if (skills !== undefined) user.profile.skills = skills;

  // Resume is optional on update; keep the existing one when no new file is sent
  if (req.file) {
    user.profile.resume = await uploadToCloudinary(req.file);
    user.profile.resumeOriginalName = req.file.originalname;
  }

  await user.save();

  return res.status(200).json({
    message: "Profile updated successfully",
    user,
    success: true,
  });
};
