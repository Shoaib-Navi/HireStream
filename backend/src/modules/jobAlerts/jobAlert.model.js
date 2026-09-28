import mongoose from "mongoose";
import { ALERT_FREQUENCIES, EMPLOYMENT_TYPES, WORK_MODES } from "../../constants/index.js";

// The same criteria as a job board search
const criteriaSchema = new mongoose.Schema(
  {
    q: { type: String, trim: true },
    location: { type: String, trim: true },
    employmentType: [{ type: String, enum: EMPLOYMENT_TYPES }],
    workMode: [{ type: String, enum: WORK_MODES }],
    experience: { type: Number, min: 0 },
    salaryMin: { type: Number, min: 0 },
  },
  { _id: false },
);

// A saved search: the candidate hears about jobs posted after the last check
const jobAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    criteria: { type: criteriaSchema, default: () => ({}) },
    // Normalized criteria, so the same search can't be saved twice
    key: { type: String, required: true },
    frequency: {
      type: String,
      enum: Object.values(ALERT_FREQUENCIES),
      default: ALERT_FREQUENCIES.DAILY,
    },
    isActive: { type: Boolean, default: true },
    // Jobs posted after this are new to the candidate; starts when the alert is created
    lastCheckedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "job_alerts" },
);

jobAlertSchema.index({ user: 1, key: 1 }, { unique: true });
jobAlertSchema.index({ isActive: 1, lastCheckedAt: 1 });

export const JobAlert = mongoose.model("JobAlert", jobAlertSchema);
