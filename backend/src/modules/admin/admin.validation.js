import { z } from "zod";
import { COMPANY_STATUS, JOB_STATUS, ROLES, USER_STATUS } from "../../constants/index.js";
import { paginationShape } from "../../validation/common.js";

const search = z.string().trim().max(100).optional();

export const listUsersQuerySchema = z.object({
  q: search,
  role: z.enum(Object.values(ROLES)).optional(),
  status: z.enum(Object.values(USER_STATUS)).optional(),
  ...paginationShape,
});

export const userStatusSchema = z.object({
  status: z.enum(Object.values(USER_STATUS), { error: "Please choose a valid status" }),
});

export const listCompaniesQuerySchema = z.object({
  q: search,
  status: z.enum(Object.values(COMPANY_STATUS)).optional(),
  isVerified: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  ...paginationShape,
});

export const updateCompanySchema = z
  .object({
    isVerified: z.boolean(),
    status: z.enum(Object.values(COMPANY_STATUS)),
  })
  .partial()
  .refine((updates) => Object.keys(updates).length > 0, { message: "Nothing to update" });

export const listJobsQuerySchema = z.object({
  q: search,
  status: z.enum(Object.values(JOB_STATUS)).optional(),
  ...paginationShape,
});

export const jobStatusSchema = z.object({
  status: z.enum(Object.values(JOB_STATUS), { error: "Please choose a valid status" }),
});
