import mongoose from "mongoose";
import { APPLICATION_STATUS } from "../../constants/index.js";

const statusChangeSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      required: true,
    },
    note: { type: String, trim: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Copied from the job so recruiter and admin queries don't need a join
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED,
    },
    statusHistory: [statusChangeSchema],
    coverLetter: { type: String, trim: true, default: "" },
    // Snapshot of the resume at the time of applying
    resume: {
      url: { type: String },
      originalName: { type: String },
    },
  },
  { timestamps: true },
);

// A candidate can apply to a job only once, even if two requests arrive at the same time
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1, createdAt: -1 });
applicationSchema.index({ company: 1, status: 1 });

export const Application = mongoose.model("Application", applicationSchema);
