import express from "express";
import { ROLES } from "../../constants/index.js";
import { authenticate, requireRole, requireVerifiedEmail } from "../../middleware/auth.js";
import { uploadImage } from "../../middleware/upload.js";
import { validate } from "../../middleware/validate.js";
import { idParams } from "../../validation/common.js";
import * as companiesController from "./companies.controller.js";
import {
  createCompanySchema,
  listCompaniesQuerySchema,
  slugParams,
  updateCompanySchema,
} from "./companies.validation.js";

const router = express.Router();
const recruiterOnly = [authenticate, requireRole(ROLES.RECRUITER)];

// Public directory
router.get("/", validate({ query: listCompaniesQuerySchema }), companiesController.listPublic);

// Recruiter's own companies (registered before /:slug so "mine" isn't treated as a slug)
router.get("/mine", recruiterOnly, companiesController.listMine);
router.get("/mine/:id", recruiterOnly, validate({ params: idParams }), companiesController.getMine);
router.post(
  "/",
  recruiterOnly,
  requireVerifiedEmail,
  validate({ body: createCompanySchema }),
  companiesController.create,
);
router.patch("/:id", recruiterOnly, validate({ params: idParams, body: updateCompanySchema }), companiesController.update);
router.put("/:id/logo", recruiterOnly, validate({ params: idParams }), uploadImage, companiesController.updateLogo);

// Public company page
router.get("/:slug", validate({ params: slugParams }), companiesController.getPublic);

export default router;
