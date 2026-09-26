import mongoose from "mongoose";

// One document per client per limiter window; MongoDB removes it once the window has ended
const rateLimitSchema = new mongoose.Schema(
  {
    _id: { type: String },
    hits: { type: Number, required: true },
    resetAt: { type: Date, required: true },
  },
  { collection: "rate_limits", versionKey: false },
);

rateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimit = mongoose.model("RateLimit", rateLimitSchema);

// express-rate-limit store backed by MongoDB. The default memory store counts per serverless
// instance, so on Vercel an attacker spread across instances would get a fresh limit on each one.
export class MongoRateLimitStore {
  localKeys = false;

  constructor(prefix) {
    this.prefix = `${prefix}:`;
  }

  init({ windowMs }) {
    this.windowMs = windowMs;
  }

  // Counts the hit in a single atomic update, starting a new window when the previous one has ended
  async increment(key) {
    const now = new Date();
    const inWindow = { $gt: ["$resetAt", now] };
    const record = await RateLimit.findOneAndUpdate(
      { _id: this.prefix + key },
      [
        {
          $set: {
            hits: { $cond: [inWindow, { $add: ["$hits", 1] }, 1] },
            resetAt: { $cond: [inWindow, "$resetAt", new Date(now.getTime() + this.windowMs)] },
          },
        },
      ],
      { upsert: true, new: true, lean: true, updatePipeline: true },
    );
    return { totalHits: record.hits, resetTime: record.resetAt };
  }

  async decrement(key) {
    await RateLimit.updateOne({ _id: this.prefix + key, hits: { $gt: 0 } }, { $inc: { hits: -1 } });
  }

  async resetKey(key) {
    await RateLimit.deleteOne({ _id: this.prefix + key });
  }
}
