import { z } from "zod";
import { EMPLOYMENT_TYPES, WORK_MODES } from "../../constants/index.js";
import { httpUrl, optionalText, phone, requiredText, stringList } from "../../validation/common.js";

const nonEmpty = (object) => Object.keys(object).length > 0;

export const updateAccountSchema = z
  .object({
    fullName: requiredText("Full name", { min: 2, max: 100 }),
    phone,
  })
  .partial()
  .refine(nonEmpty, { message: "Nothing to update" });

const experienceItem = z
  .object({
    title: requiredText("Job title", { max: 100 }),
    company: requiredText("Company", { max: 100 }),
    location: optionalText("Location", 100).optional(),
    startDate: z.coerce.date({ error: "Start date is required" }),
    endDate: z.coerce.date().nullable().optional(),
    isCurrent: z.boolean().default(false),
    description: optionalText("Description", 2000).optional(),
  })
  .refine((item) => item.isCurrent || !item.endDate || item.endDate >= item.startDate, {
    message: "End date can't be before the start date",
    path: ["endDate"],
  });

const currentYear = new Date().getFullYear();
const year = z.coerce.number().int().min(1950).max(currentYear + 10);

const educationItem = z
  .object({
    institution: requiredText("Institution", { max: 150 }),
    degree: requiredText("Degree", { max: 100 }),
    fieldOfStudy: optionalText("Field of study", 100).optional(),
    startYear: year.nullable().optional(),
    endYear: year.nullable().optional(),
    grade: optionalText("Grade", 30).optional(),
  })
  .refine((item) => !item.startYear || !item.endYear || item.endYear >= item.startYear, {
    message: "End year can't be before the start year",
    path: ["endYear"],
  });

export const updateProfileSchema = z
  .object({
    headline: optionalText("Headline", 120),
    bio: optionalText("Bio", 2000),
    location: optionalText("Location", 100),
    skills: stringList("Skills", { maxItems: 50, maxLength: 50 }),
    experienceYears: z.coerce.number().min(0).max(60).nullable(),
    experience: z.array(experienceItem).max(20, "At most 20 experience entries are allowed"),
    education: z.array(educationItem).max(10, "At most 10 education entries are allowed"),
    links: z
      .object({
        linkedin: httpUrl("LinkedIn URL"),
        github: httpUrl("GitHub URL"),
        portfolio: httpUrl("Portfolio URL"),
        website: httpUrl("Website URL"),
      })
      .partial(),
    preferences: z
      .object({
        employmentTypes: z.array(z.enum(EMPLOYMENT_TYPES)).max(EMPLOYMENT_TYPES.length),
        workModes: z.array(z.enum(WORK_MODES)).max(WORK_MODES.length),
        locations: stringList("Preferred locations", { maxItems: 10, maxLength: 100 }),
        expectedSalary: z.coerce.number().min(0).max(10000).nullable(),
      })
      .partial(),
    isOpenToWork: z.boolean(),
  })
  .partial()
  .refine(nonEmpty, { message: "Nothing to update" });
