// Usage: npm run migrate
// Take a database backup (e.g. MongoDB Atlas snapshot) before running this against production.
import { connectDB, disconnectDB } from "../config/db.js";
import { runMigrations } from "../migrations/runner.js";

try {
  await connectDB();
  await runMigrations();
  console.log("Migrations complete");
  await disconnectDB();
} catch (error) {
  console.error("Migration failed:", error.message);
  await disconnectDB();
  process.exit(1);
}
