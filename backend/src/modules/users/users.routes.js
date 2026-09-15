import express from "express";
import { ROLES } from "../../constants/index.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { uploadImage, uploadResume } from "../../middleware/upload.js";
import { validate } from "../../middleware/validate.js";
import * as usersController from "./users.controller.js";
import { updateAccountSchema, updateProfileSchema } from "./users.validation.js";

const router = express.Router();
const candidateOnly = requireRole(ROLES.CANDIDATE);

router.use(authenticate);

// Account (every role)
router.patch("/me", validate({ body: updateAccountSchema }), usersController.updateAccount);
router.put("/me/avatar", uploadImage, usersController.updateAvatar);

// Candidate profile
router.get("/me/profile", candidateOnly, usersController.getProfile);
router.patch("/me/profile", candidateOnly, validate({ body: updateProfileSchema }), usersController.updateProfile);
router.put("/me/resume", candidateOnly, uploadResume, usersController.updateResume);
router.delete("/me/resume", candidateOnly, usersController.removeResume);

export default router;
