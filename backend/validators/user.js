import { z } from "zod";
import { blankToUndefined, optionalText, requiredText } from "./common.js";

const email = z
  .string({ error: "Email is required" })
  .trim()
  .pipe(z.email("Please enter a valid email address").max(254));

const phoneNumber = z
  .string({ error: "Phone number is required" })
  .trim()
  .regex(/^\+?[0-9][0-9\s-]{6,17}$/, "Please enter a valid phone number");

const role = z.enum(["student", "recruiter"], { error: "Please select a role" });

export const registerSchema = z.object({
  fullname: requiredText("Full name", 100),
  email,
  phoneNumber,
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  role,
});

export const loginSchema = z.object({
  email,
  password: z.string({ error: "Password is required" }).min(1, "Password is required").max(128),
  role,
});

export const updateProfileSchema = z.object({
  fullname: blankToUndefined(requiredText("Full name", 100)),
  email: blankToUndefined(email),
  phoneNumber: blankToUndefined(phoneNumber),
  bio: optionalText("Bio", 500),
  // comma-separated list, e.g. "React, Node.js"
  skills: optionalText("Skills", 500).transform((value) =>
    value === undefined
      ? undefined
      : value
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
  ),
});
