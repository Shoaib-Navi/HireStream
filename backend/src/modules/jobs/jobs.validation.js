import { z } from "zod";
import { EMPLOYMENT_TYPES, JOB_STATUS, WORK_MODES } from "../../constants/index.js";
import { csvEnumList, objectId, paginationShape, requiredText, stringList } from "../../validation/common.js";

const experienceRange = z
  .object({
    min: z.coerce.number().int().min(0).max(50).default(0),
    max: z.coerce.number().int().min(0).max(50).nullable().default(null),
  })
  .refine((range) => range.max === null || range.max >= range.min, {
    message: "Maximum experience must be at least the minimum",
    path: ["max"],
  });

// Annual salary in LPA
const salaryRange = z
  .object({
    min: z.coerce.number().min(0).max(10000).nullable().default(null),
    max: z.coerce.number().min(0).max(10000).nullable().default(null),
  })
  .refine((range) => range.min === null || range.max === null || range.max >= range.min, {
    message: "Maximum salary must be at least the minimum",
    path: ["max"],
  });

// Field rules without top-level defaults, so partial updates never reset fields that weren't sent
const jobFields = {
  title: requiredText("Title", { min: 3, max: 120 }),
  description: requiredText("Description", { min: 30, max: 10000 }),
  requirements: stringList("Requirements", { maxItems: 30, maxLength: 300 }),
  responsibilities: stringList("Responsibilities", { maxItems: 30, maxLength: 300 }),
  skills: stringList("Skills", { maxItems: 30, maxLength: 50 }),
  employmentType: z.enum(EMPLOYMENT_TYPES, { error: "Please choose an employment type" }),
  workMode: z.enum(WORK_MODES, { error: "Please choose a work mode" }),
  location: requiredText("Location", { max: 100 }),
  experience: experienceRange,
  salary: salaryRange,
  openings: z.coerce.number().int().min(1, "There must be at least 1 opening").max(1000),
  deadline: z.coerce
    .date()
    .nullable()
    .refine((date) => date === null || date > new Date(), { message: "Deadline must be in the future" }),
  companyId: objectId,
};

export const createJobSchema = z.object({
  ...jobFields,
  requirements: jobFields.requirements.default([]),
  responsibilities: jobFields.responsibilities.default([]),
  skills: jobFields.skills.default([]),
  experience: experienceRange.default({ min: 0, max: null }),
  salary: salaryRange.default({ min: null, max: null }),
  openings: jobFields.openings.default(1),
  deadline: jobFields.deadline.default(null),
  status: z.enum([JOB_STATUS.DRAFT, JOB_STATUS.OPEN]).default(JOB_STATUS.OPEN),
});

export const updateJobSchema = z
  .object(jobFields)
  .partial()
  .refine((updates) => Object.keys(updates).length > 0, { message: "Nothing to update" });

export const jobStatusSchema = z.object({
  status: z.enum(Object.values(JOB_STATUS), { error: "Please choose a valid status" }),
});

export const listJobsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  location: z.string().trim().max(100).optional(),
  employmentType: csvEnumList(EMPLOYMENT_TYPES),
  workMode: csvEnumList(WORK_MODES),
  // candidate's years of experience: jobs requiring more are excluded
  experience: z.coerce.number().min(0).max(60).optional(),
  salaryMin: z.coerce.number().min(0).max(10000).optional(),
  company: objectId.optional(),
  sort: z.enum(["newest", "salary"]).default("newest"),
  ...paginationShape,
});

export const myJobsQuerySchema = z.object({
  status: z.enum(Object.values(JOB_STATUS)).optional(),
  ...paginationShape,
});
