import express from "express";
import { ROLES } from "../../constants/index.js";
import { authenticate, optionalAuth, requireRole, requireVerifiedEmail } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { idParams } from "../../validation/common.js";
import * as jobsController from "./jobs.controller.js";
import { createJobSchema, listJobsQuerySchema, myJobsQuerySchema } from "./jobs.validation.js";

const router = express.Router();
const recruiterOnly = [authenticate, requireRole(ROLES.RECRUITER)];

// Public: visitors can browse jobs without an account
router.get("/", validate({ query: listJobsQuerySchema }), optionalAuth, jobsController.listPublic);

// Recruiter (registered before /:id so "mine" isn't treated as an id)
router.get("/mine", recruiterOnly, validate({ query: myJobsQuerySchema }), jobsController.listMine);
router.post("/", recruiterOnly, requireVerifiedEmail, validate({ body: createJobSchema }), jobsController.create);

router.get("/:id", validate({ params: idParams }), optionalAuth, jobsController.getOne);

export default router;
