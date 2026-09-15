import express from "express";
import { getAdminJobs, getAllJobs, getJobById, postJob } from "../controller/job.js";
import { isAuthenticated, optionalAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../validators/common.js";
import { postJobSchema } from "../validators/job.js";

const router = express.Router();

// Public: visitors can browse jobs without an account
router.get("/get", getAllJobs);
router.get("/get/:id", validate({ params: idParams }), optionalAuth, getJobById);

// Recruiter only
router.post("/post", isAuthenticated, requireRole("recruiter"), validate({ body: postJobSchema }), postJob);
router.get("/getadminjobs", isAuthenticated, requireRole("recruiter"), getAdminJobs);

export default router;
