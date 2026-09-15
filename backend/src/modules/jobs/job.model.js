import mongoose from "mongoose";
import { EMPLOYMENT_TYPES, JOB_STATUS, WORK_MODES } from "../../constants/index.js";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    requirements: [{ type: String, trim: true }],
    responsibilities: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],
    employmentType: {
      type: String,
      enum: EMPLOYMENT_TYPES,
      required: true,
    },
    workMode: {
      type: String,
      enum: WORK_MODES,
      required: true,
      default: "onsite",
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    // Years of experience
    experience: {
      min: { type: Number, default: 0, min: 0 },
      max: { type: Number, min: 0 },
    },
    // Annual salary in LPA (lakhs per annum)
    salary: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: "INR" },
    },
    openings: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.OPEN,
    },
    deadline: { type: Date },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Total applications received (kept in sync when candidates apply)
    applicationCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    closedAt: { type: Date },
  },
  { timestamps: true },
);

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ postedBy: 1, createdAt: -1 });

export const Job = mongoose.model("Job", jobSchema);
