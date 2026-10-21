import mongoose from "mongoose";
import { NOTIFICATION_RETENTION_DAYS, NOTIFICATION_TYPES } from "../../constants/index.js";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true },
    // In-app path to open, e.g. /dashboard/applications/:id
    link: { type: String },
    readAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "notifications" },
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, readAt: 1 });
// Old notifications are removed automatically
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 });

export const Notification = mongoose.model("Notification", notificationSchema);
