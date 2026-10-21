import { z } from "zod";
import { SIGNUP_ROLES } from "../../constants/index.js";
import { email, password, phone, requiredText } from "../../validation/common.js";

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
