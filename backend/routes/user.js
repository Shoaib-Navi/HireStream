import express from "express";
import { getCurrentUser, login, logout, register, updateProfile } from "../controller/user.js";
import { isAuthenticated } from "../middleware/auth.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimit.js";
import { uploadImage, uploadResume } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema, updateProfileSchema } from "../validators/user.js";

const router = express.Router();

// multipart forms: the upload middleware parses the body, then it is validated
router.post("/register", registerLimiter, uploadImage, validate({ body: registerSchema }), register);
router.post("/login", loginLimiter, validate({ body: loginSchema }), login);
router.post("/logout", logout);
router.get("/me", isAuthenticated, getCurrentUser);
router.post(
  "/profile/update",
  isAuthenticated,
  uploadResume,
  validate({ body: updateProfileSchema }),
  updateProfile,
);

export default router;
