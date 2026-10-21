import express from "express";
import { ROLES } from "../../constants/index.js";
import { authenticate, optionalAuth, requireRole } from "../../middleware/auth.js";
import { aiLimiter } from "../../middleware/rateLimit.js";
import { validate } from "../../middleware/validate.js";
import * as aiController from "./ai.controller.js";
import { chatSchema, jobDescriptionSchema } from "./ai.validation.js";

const router = express.Router();

router.post("/chat", aiLimiter, optionalAuth, validate({ body: chatSchema }), aiController.chat);

// Drafts a job description from what the recruiter has filled in so far
router.post(
  "/job-description",
  authenticate,
  requireRole(ROLES.RECRUITER),
  aiLimiter,
  validate({ body: jobDescriptionSchema }),
  aiController.jobDescription,
);

export default router;
