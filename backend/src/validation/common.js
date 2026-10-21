import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const idParams = z.object({ id: objectId });

export const requiredText = (label, { min = 1, max }) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, min === 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

export const optionalText = (label, max) =>
  z.string().trim().max(max, `${label} must be at most ${max} characters`);

// "" is allowed so a field can be cleared
export const httpUrl = (label) =>
  z
    .string()
    .trim()
    .max(300, `${label} is too long`)
    .refine((value) => value === "" || /^https?:\/\/[^\s]+$/i.test(value), {
      message: `${label} must start with http:// or https://`,
    });

export const email = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .pipe(z.email("Please enter a valid email address").max(254));

export const phone = z
  .string({ error: "Phone number is required" })
  .trim()
  .regex(/^\+?[0-9][0-9\s-]{6,17}$/, "Please enter a valid phone number");

export const password = z
  .string({ error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .refine((value) => /[a-z]/i.test(value) && /\d/.test(value), {
    message: "Password must contain at least one letter and one number",
  });

// Trimmed, de-duplicated list of short strings (skills, requirements...)
export const stringList = (label, { maxItems, maxLength }) =>
  z
    .array(
      z
        .string()
        .trim()
        .min(1, `${label} can't contain empty entries`)
        .max(maxLength, `${label} entries must be at most ${maxLength} characters`),
    )
    .max(maxItems, `At most ${maxItems} ${label.toLowerCase()} are allowed`)
    .transform((items) => [...new Set(items)]);

// Accepts ?type=a,b as well as ?type=a&type=b
export const csvEnumList = (values) =>
  z
    .preprocess(
      (value) =>
        typeof value === "string"
          ? value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : value,
      z.array(z.enum(values)).max(values.length),
    )
    .optional();

export const paginationShape = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
};
