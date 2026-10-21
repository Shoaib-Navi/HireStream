import express from "express";
import { optionalAuth } from "../../middleware/auth.js";
import { aiLimiter } from "../../middleware/rateLimit.js";
import { validate } from "../../middleware/validate.js";
import * as aiController from "./ai.controller.js";
import { chatSchema } from "./ai.validation.js";

const router = express.Router();

router.post("/chat", aiLimiter, optionalAuth, validate({ body: chatSchema }), aiController.chat);

export default router;
