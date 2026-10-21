import express from "express";
import { ROLES } from "../../constants/index.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { requireCronSecret } from "../../middleware/cronAuth.js";
import { validate } from "../../middleware/validate.js";
import { idParams } from "../../validation/common.js";
import * as jobAlertsController from "./jobAlerts.controller.js";
import { createAlertSchema, updateAlertSchema } from "./jobAlerts.validation.js";

const router = express.Router();

// Scheduler only (Vercel Cron sends GET), registered before the candidate check
router.get("/dispatch", requireCronSecret, jobAlertsController.dispatch);

router.use(authenticate, requireRole(ROLES.CANDIDATE));

router.get("/", jobAlertsController.list);
router.post("/", validate({ body: createAlertSchema }), jobAlertsController.create);
router.patch("/:id", validate({ params: idParams, body: updateAlertSchema }), jobAlertsController.update);
router.delete("/:id", validate({ params: idParams }), jobAlertsController.remove);

export default router;
