import express from "express";
import { ROLES } from "../../constants/index.js";
import { authenticate, optionalAuth, requireRole, requireVerifiedEmail } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { idParams } from "../../validation/common.js";
import * as jobsController from "./jobs.controller.js";
import {
  createJobSchema,
  jobStatusSchema,
  listJobsQuerySchema,
  myJobsQuerySchema,
  updateJobSchema,
} from "./jobs.validation.js";

const router = express.Router();
const recruiterOnly = [authenticate, requireRole(ROLES.RECRUITER)];

// Public: visitors can browse jobs without an account
router.get("/", validate({ query: listJobsQuerySchema }), optionalAuth, jobsController.listPublic);

// Recruiter (registered before /:id so "mine" isn't treated as an id)
router.get("/mine", recruiterOnly, validate({ query: myJobsQuerySchema }), jobsController.listMine);
router.post("/", recruiterOnly, requireVerifiedEmail, validate({ body: createJobSchema }), jobsController.create);
router.patch("/:id", recruiterOnly, validate({ params: idParams, body: updateJobSchema }), jobsController.update);
router.patch("/:id/status", recruiterOnly, validate({ params: idParams, body: jobStatusSchema }), jobsController.updateStatus);
router.delete("/:id", recruiterOnly, validate({ params: idParams }), jobsController.remove);

router.get("/:id", validate({ params: idParams }), optionalAuth, jobsController.getOne);

export default router;
