import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const idParams = z.object({ id: objectId });

export const requiredText = (label, max) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

export const optionalText = (label, max) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .optional();

// Multipart forms send every field as a string, and "" means "not provided"
export const blankToUndefined = (schema) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());
