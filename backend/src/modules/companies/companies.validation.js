import { z } from "zod";
import { COMPANY_SIZES } from "../../constants/index.js";
import { httpUrl, optionalText, requiredText } from "../../validation/common.js";

const companyFields = z.object({
  name: requiredText("Company name", { min: 2, max: 100 }),
  description: optionalText("Description", 5000),
  website: httpUrl("Website"),
  location: optionalText("Location", 100),
  industry: optionalText("Industry", 60),
  size: z.enum(COMPANY_SIZES, { error: "Please choose a valid company size" }).nullable(),
  foundedYear: z.coerce
    .number()
    .int()
    .min(1800, "Founded year looks too early")
    .max(new Date().getFullYear(), "Founded year can't be in the future")
    .nullable(),
});

export const createCompanySchema = companyFields.partial().required({ name: true });

export const updateCompanySchema = companyFields
  .partial()
  .refine((updates) => Object.keys(updates).length > 0, { message: "Nothing to update" });
