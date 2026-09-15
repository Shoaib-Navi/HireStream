import crypto from "node:crypto";
import { AuthToken } from "./authToken.model.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// Creates a new token and invalidates older ones with the same purpose, so only the latest link works
export const issueToken = async (userId, purpose, ttlMs) => {
  await AuthToken.deleteMany({ user: userId, purpose });
  const token = crypto.randomBytes(32).toString("hex");
  await AuthToken.create({
    user: userId,
    purpose,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + ttlMs),
  });
  return token;
};

// Deletes the token while reading it, so the same link can't be used twice. Returns null if invalid or expired.
export const consumeToken = (token, purpose) =>
  AuthToken.findOneAndDelete({ tokenHash: hashToken(token), purpose, expiresAt: { $gt: new Date() } });
