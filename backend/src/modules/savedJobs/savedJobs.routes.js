import express from "express";
import { z } from "zod";
import { ROLES } from "../../constants/index.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { objectId, paginationShape } from "../../validation/common.js";
import * as savedJobsController from "./savedJobs.controller.js";

const router = express.Router();

const jobIdParams = z.object({ jobId: objectId });

router.use(authenticate, requireRole(ROLES.CANDIDATE));

router.get("/", validate({ query: z.object(paginationShape) }), savedJobsController.list);
// PUT and DELETE are idempotent: repeating them has no extra effect
router.put("/:jobId", validate({ params: jobIdParams }), savedJobsController.save);
router.delete("/:jobId", validate({ params: jobIdParams }), savedJobsController.remove);

export default router;
