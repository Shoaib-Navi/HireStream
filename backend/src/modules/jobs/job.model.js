import mongoose from "mongoose";
import { DATA_SOURCES, EMPLOYMENT_TYPES, JOB_STATUS, WORK_MODES } from "../../constants/index.js";

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
    // Set only on seeded development data: PUBLIC_SOURCE (fetched from a company's public
    // job board) or SYNTHETIC (written for demos). Jobs posted through the app stay unmarked.
    source: {
      type: String,
      enum: Object.values(DATA_SOURCES),
      index: true,
    },
    // The posting on the board it came from, and that board's own id for it
    sourceUrl: { type: String, trim: true },
    externalId: { type: String, trim: true },
    // When the posting went live at its source; app-posted jobs use createdAt instead
    postedAt: { type: Date },
  },
  { timestamps: true },
);

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ postedBy: 1, createdAt: -1 });
// One row per posting per source, so re-seeding can never duplicate a fetched job
jobSchema.index(
  { source: 1, externalId: 1 },
  { unique: true, partialFilterExpression: { externalId: { $type: "string" } } },
);

export const Job = mongoose.model("Job", jobSchema);
