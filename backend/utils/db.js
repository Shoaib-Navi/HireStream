import mongoose from "mongoose";
import { env } from "../config/env.js";

let connectionPromise = null;

// Reuses one connection across requests. On Vercel a warm function instance keeps it between invocations.
const connectDB = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.mongoUri)
      .then((connection) => {
        console.log("mongodb connected successfully");
        return connection;
      })
      .catch((error) => {
        // allow the next request to retry instead of caching the failure
        connectionPromise = null;
        throw error;
      });
  }
  return connectionPromise;
};

export default connectDB;
