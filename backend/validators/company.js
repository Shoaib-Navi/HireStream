import { z } from "zod";
import { requiredText } from "./common.js";

export const registerCompanySchema = z.object({
  companyName: requiredText("Company name", 100),
});

export const updateCompanySchema = z.object({
  name: requiredText("Company name", 100),
  description: z.string().trim().max(1000, "Description must be at most 1000 characters").default(""),
  website: z
    .string()
    .trim()
    .max(200, "Website must be at most 200 characters")
    .refine((value) => value === "" || /^https?:\/\/[^\s]+$/i.test(value), {
      message: "Website must start with http:// or https://",
    })
    .default(""),
  location: z.string().trim().max(100, "Location must be at most 100 characters").default(""),
});
