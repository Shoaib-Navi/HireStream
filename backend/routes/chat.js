import express from "express";
import { chat } from "../controller/chat.js";
import { optionalAuth } from "../middleware/auth.js";
import { chatLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { chatSchema } from "../validators/chat.js";

const router = express.Router();

router.post("/", chatLimiter, optionalAuth, validate({ body: chatSchema }), chat);

export default router;
