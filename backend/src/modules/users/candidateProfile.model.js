import mongoose from "mongoose";
import { EMPLOYMENT_TYPES, WORK_MODES } from "../../constants/index.js";

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, trim: true },
});

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  fieldOfStudy: { type: String, trim: true },
  startYear: { type: Number },
  endYear: { type: Number },
  grade: { type: String, trim: true },
});

// Job seeker details, one document per candidate user
const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    headline: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, min: 0 },
    experience: [experienceSchema],
    education: [educationSchema],
    links: {
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      portfolio: { type: String, trim: true },
      website: { type: String, trim: true },
    },
    resume: {
      url: { type: String },
      publicId: { type: String },
      originalName: { type: String },
      uploadedAt: { type: Date },
    },
    preferences: {
      employmentTypes: [{ type: String, enum: EMPLOYMENT_TYPES }],
      workModes: [{ type: String, enum: WORK_MODES }],
      locations: [{ type: String, trim: true }],
      // expected annual salary in LPA
      expectedSalary: { type: Number, min: 0 },
    },
    isOpenToWork: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "candidate_profiles" },
);

export const CandidateProfile = mongoose.model("CandidateProfile", candidateProfileSchema);
