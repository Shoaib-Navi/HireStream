import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import applicationRoute from "./routes/application.js";
import chatRoute from "./routes/chat.js";
import companyRoute from "./routes/company.js";
import jobRoute from "./routes/job.js";
import userRoute from "./routes/user.js";
import connectDB from "./utils/db.js";

const app = express();

// Vercel sits behind a proxy; trust it so rate limiting sees the real client IP
if (env.isVercel) {
  app.set("trust proxy", 1);
}

// Middleware
app.use(helmet());
app.use(cors({ origin: env.clientUrls, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());

app.use("/api", apiLimiter);

// Ensure the (cached) database connection is ready before any route uses a model
app.use("/api", async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/chat", chatRoute);

app.use(notFound);
app.use(errorHandler);

export default app;
