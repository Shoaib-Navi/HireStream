import express from "express";
import adminRoutes from "./modules/admin/admin.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import { applicationsRouter, jobApplicationsRouter } from "./modules/applications/applications.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import companiesRoutes from "./modules/companies/companies.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import jobsRoutes from "./modules/jobs/jobs.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
import savedJobsRoutes from "./modules/savedJobs/savedJobs.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import { sendSuccess } from "./utils/response.js";

// Every API module is mounted here, under /api/v1
const router = express.Router();

router.get("/health", (req, res) => sendSuccess(res, { data: { status: "ok" } }));

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/companies", companiesRoutes);
router.use("/jobs/:jobId/applications", jobApplicationsRouter);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationsRouter);
router.use("/saved-jobs", savedJobsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/admin", adminRoutes);
router.use("/ai", aiRoutes);

export default router;
