import mongoose from "mongoose";
import { ROLES, USER_STATUS } from "../../constants/index.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // String keeps leading zeros and country codes (+91)
    phone: {
      type: String,
      trim: true,
    },
    // Never returned unless requested with .select("+password")
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      index: true,
    },
    avatar: {
      url: { type: String },
      publicId: { type: String },
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
      index: true,
    },
    emailVerifiedAt: { type: Date },
    lastLoginAt: { type: Date },
    // Incremented when the password changes to sign out every existing session
    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.tokenVersion;
        delete ret.__v;
        ret.isEmailVerified = Boolean(ret.emailVerifiedAt);
        return ret;
      },
    },
  },
);

export const User = mongoose.model("User", userSchema);
