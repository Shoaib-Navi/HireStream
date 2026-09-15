import express from "express";
import { authenticate } from "../../middleware/auth.js";
import { accountSecurityLimiter, emailLimiter, loginLimiter, registerLimiter } from "../../middleware/rateLimit.js";
import { validate } from "../../middleware/validate.js";
import * as authController from "./auth.controller.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validation.js";

const router = express.Router();

router.post("/register", registerLimiter, validate({ body: registerSchema }), authController.register);
router.post("/login", loginLimiter, validate({ body: loginSchema }), authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

// Email verification
router.post("/verify-email", accountSecurityLimiter, validate({ body: verifyEmailSchema }), authController.verifyEmail);
router.post("/verify-email/resend", authenticate, emailLimiter, authController.resendVerification);

// Passwords
router.post("/forgot-password", emailLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post("/reset-password", accountSecurityLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);
router.patch(
  "/password",
  authenticate,
  accountSecurityLimiter,
  validate({ body: changePasswordSchema }),
  authController.changePassword,
);

export default router;
