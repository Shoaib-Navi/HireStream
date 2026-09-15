import { z } from "zod";
import { APPLICATION_STATUS, RECRUITER_STATUSES } from "../../constants/index.js";
import { objectId, optionalText, paginationShape } from "../../validation/common.js";

export const jobIdParams = z.object({ jobId: objectId });

export const applySchema = z.object({
  coverLetter: optionalText("Cover letter", 5000).default(""),
});

export const applicationListQuerySchema = z.object({
  status: z.enum(Object.values(APPLICATION_STATUS)).optional(),
  ...paginationShape,
});

export const updateStatusSchema = z.object({
  status: z.enum(RECRUITER_STATUSES, { error: "Please choose a valid status" }),
  note: optionalText("Note", 500).optional(),
});
