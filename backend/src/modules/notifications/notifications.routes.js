import express from "express";
import { z } from "zod";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { sendSuccess } from "../../utils/response.js";
import { idParams, paginationShape } from "../../validation/common.js";
import * as notificationsService from "./notifications.service.js";

const listQuerySchema = z.object({
  unread: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  ...paginationShape,
});

const router = express.Router();

router.use(authenticate);

router.get("/", validate({ query: listQuerySchema }), async (req, res) => {
  const { notifications, meta } = await notificationsService.listNotifications(req.user.id, req.query);
  sendSuccess(res, { data: { notifications }, meta });
});

router.patch("/read-all", async (req, res) => {
  const updated = await notificationsService.markAllNotificationsRead(req.user.id);
  sendSuccess(res, { message: "All notifications marked as read", data: { updated } });
});

router.patch("/:id/read", validate({ params: idParams }), async (req, res) => {
  const notification = await notificationsService.markNotificationRead(req.user.id, req.params.id);
  sendSuccess(res, { data: { notification } });
});

export default router;
