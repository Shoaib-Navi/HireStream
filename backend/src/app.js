import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { requestLogger } from "./middleware/requestLogger.js";
import apiRoutes from "./routes.js";

const app = express();

// Vercel sits behind a proxy; trust it so rate limiting sees the real client IP
if (env.isVercel) {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors({ origin: env.clientUrls, credentials: true }));
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true, limit: "200kb" }));
app.use(cookieParser());

app.use("/api", requestLogger);
app.use("/api", apiLimiter);

// Ensure the (cached) database connection is ready before any route uses a model
app.use("/api", async (req, res, next) => {
  await connectDB();
  next();
});

app.use("/api/v1", apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
