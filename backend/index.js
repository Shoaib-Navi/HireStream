import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.js";
import companyRoute from "./routes/company.js";
import jobRoute from "./routes/job.js";
import ApplicationRoute from "./routes/application.js";

dotenv.config({});

// Connect DB at top level (not inside app.listen)
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS — allow both local and Vercel frontend
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://hirestream-frontend-liard.vercel.app",
    process.env.CLIENT_URL,
  ],
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", ApplicationRoute);

export default app;

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
