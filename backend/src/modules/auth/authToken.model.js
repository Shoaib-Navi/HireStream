import mongoose from "mongoose";
import { TOKEN_PURPOSE } from "../../constants/index.js";

// Single-use tokens sent by email. Only a SHA-256 hash is stored, so a database leak can't be used to take over accounts.
const authTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    purpose: {
      type: String,
      enum: Object.values(TOKEN_PURPOSE),
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true, collection: "auth_tokens" },
);

authTokenSchema.index({ user: 1, purpose: 1 });
// MongoDB removes expired tokens automatically
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AuthToken = mongoose.model("AuthToken", authTokenSchema);
