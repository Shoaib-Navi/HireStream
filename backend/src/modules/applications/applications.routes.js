import express from "express";
import { ROLES } from "../../constants/index.js";
import { authenticate, requireRole, requireVerifiedEmail } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { idParams } from "../../validation/common.js";
import * as applicationsController from "./applications.controller.js";
import {
  applicationListQuerySchema,
  applySchema,
  jobIdParams,
  updateStatusSchema,
} from "./applications.validation.js";

const candidateOnly = [authenticate, requireRole(ROLES.CANDIDATE)];
const recruiterOnly = [authenticate, requireRole(ROLES.RECRUITER)];

// Mounted at /jobs/:jobId/applications
export const jobApplicationsRouter = express.Router({ mergeParams: true });

jobApplicationsRouter.post(
  "/",
  candidateOnly,
  requireVerifiedEmail,
  validate({ params: jobIdParams, body: applySchema }),
  applicationsController.apply,
);
jobApplicationsRouter.get(
  "/",
  recruiterOnly,
  validate({ params: jobIdParams, query: applicationListQuerySchema }),
  applicationsController.listForJob,
);

// Mounted at /applications
export const applicationsRouter = express.Router();

applicationsRouter.get("/mine", candidateOnly, validate({ query: applicationListQuerySchema }), applicationsController.listMine);
applicationsRouter.get("/:id", authenticate, validate({ params: idParams }), applicationsController.getOne);
applicationsRouter.patch(
  "/:id/status",
  recruiterOnly,
  validate({ params: idParams, body: updateStatusSchema }),
  applicationsController.updateStatus,
);
