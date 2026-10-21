import express from "express";
import { ROLES } from "../../constants/index.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { idParams } from "../../validation/common.js";
import * as adminController from "./admin.controller.js";
import {
  jobStatusSchema,
  listCompaniesQuerySchema,
  listJobsQuerySchema,
  listUsersQuerySchema,
  updateCompanySchema,
  userStatusSchema,
} from "./admin.validation.js";

const router = express.Router();

router.use(authenticate, requireRole(ROLES.ADMIN));

router.get("/overview", adminController.overview);

router.get("/users", validate({ query: listUsersQuerySchema }), adminController.listUsers);
router.patch("/users/:id/status", validate({ params: idParams, body: userStatusSchema }), adminController.updateUserStatus);

router.get("/companies", validate({ query: listCompaniesQuerySchema }), adminController.listCompanies);
router.patch("/companies/:id", validate({ params: idParams, body: updateCompanySchema }), adminController.updateCompany);

router.get("/jobs", validate({ query: listJobsQuerySchema }), adminController.listJobs);
router.patch("/jobs/:id/status", validate({ params: idParams, body: jobStatusSchema }), adminController.updateJobStatus);
router.delete("/jobs/:id", validate({ params: idParams }), adminController.removeJob);

export default router;
