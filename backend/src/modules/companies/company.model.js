import mongoose from "mongoose";
import { COMPANY_SIZES, COMPANY_STATUS, DATA_SOURCES } from "../../constants/index.js";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    // URL-friendly unique id for public company pages, e.g. /companies/acme-corp
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    industry: { type: String, trim: true, default: "" },
    size: { type: String, enum: COMPANY_SIZES },
    foundedYear: { type: Number },
    logo: {
      url: { type: String },
      publicId: { type: String },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Set by an admin after checking the company is real
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(COMPANY_STATUS),
      default: COMPANY_STATUS.ACTIVE,
      index: true,
    },
    // Marks seeded development records; companies registered through the app stay unmarked
    source: {
      type: String,
      enum: Object.values(DATA_SOURCES),
      index: true,
    },
    sourceUrl: { type: String, trim: true },
    externalId: { type: String, trim: true },
  },
  { timestamps: true },
);

export const Company = mongoose.model("Company", companySchema);
