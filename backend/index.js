import app from "./app.js";
import { env } from "./config/env.js";
import connectDB from "./utils/db.js";

// On Vercel the exported app runs as a serverless function, so only listen when running locally.
if (!env.isVercel) {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Server running at port ${env.port}`);
  });
}

export default app;
