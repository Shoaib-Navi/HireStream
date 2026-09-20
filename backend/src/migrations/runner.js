import mongoose from "mongoose";
import { allModels } from "../models.js";
import { migrations } from "./index.js";

const MIGRATIONS_COLLECTION = "migrations";

export const runMigrations = async ({ log = console.log } = {}) => {
  const db = mongoose.connection.db;
  const history = db.collection(MIGRATIONS_COLLECTION);
  const applied = new Set((await history.find().toArray()).map((migration) => migration.name));

  for (const migration of migrations) {
    if (applied.has(migration.name)) {
      log(`✓ ${migration.name} (already applied)`);
      continue;
    }
    log(`→ ${migration.name}`);
    await migration.up(db, (message) => log(`  ${message}`));
    await history.insertOne({ name: migration.name, appliedAt: new Date() });
    log(`✓ ${migration.name}`);
  }

  for (const model of allModels) {
    await model.syncIndexes();
  }
  log("✓ indexes synchronized");
};
