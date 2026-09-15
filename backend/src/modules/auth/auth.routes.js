import express from "express";
import { authenticate } from "../../middleware/auth.js";
import { loginLimiter, registerLimiter } from "../../middleware/rateLimit.js";
import { validate } from "../../middleware/validate.js";
import * as authController from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

const router = express.Router();

router.post("/register", registerLimiter, validate({ body: registerSchema }), authController.register);
router.post("/login", loginLimiter, validate({ body: loginSchema }), authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
