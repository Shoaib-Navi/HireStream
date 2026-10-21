import { z } from "zod";
import { SIGNUP_ROLES } from "../../constants/index.js";
import { email, password, phone, requiredText } from "../../validation/common.js";

// Tokens from email links are 32 random bytes in hex
const emailToken = z
  .string({ error: "This link is invalid" })
  .trim()
  .regex(/^[a-f0-9]{64}$/i, "This link is invalid");

export const registerSchema = z.object({
  fullName: requiredText("Full name", { min: 2, max: 100 }),
  email,
  phone,
  password,
  role: z.enum(SIGNUP_ROLES, { error: "Please choose whether you are a job seeker or a recruiter" }),
});

export const loginSchema = z.object({
  email,
  password: z.string({ error: "Password is required" }).min(1, "Password is required").max(128),
});

export const verifyEmailSchema = z.object({
  token: emailToken,
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z.object({
  token: emailToken,
  password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({ error: "Current password is required" }).min(1, "Current password is required").max(128),
  newPassword: password,
});
