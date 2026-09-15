import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";

// On Vercel the exported app runs as a serverless function, so only listen when running locally.
if (!env.isVercel) {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Server running at port ${env.port}`);
  });
}

export default app;
