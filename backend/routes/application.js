import express from "express";
import { applyJob, getApplicants, getAppliedJobs, updateStatus } from "../controller/application.js";
import { isAuthenticated, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateStatusSchema } from "../validators/application.js";
import { idParams } from "../validators/common.js";

const router = express.Router();

router.use(isAuthenticated);

// Student only
router.post("/apply/:id", requireRole("student"), validate({ params: idParams }), applyJob);
router.get("/get", requireRole("student"), getAppliedJobs);

// Recruiter only (ownership is checked in the controller)
router.get("/:id/applicants", requireRole("recruiter"), validate({ params: idParams }), getApplicants);
router.post(
  "/status/:id/update",
  requireRole("recruiter"),
  validate({ params: idParams, body: updateStatusSchema }),
  updateStatus,
);

export default router;
