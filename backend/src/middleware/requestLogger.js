import { env } from "../config/env.js";

// One line per API request: method, path, status and how long it took.
// Silent during tests so the test output stays readable.
export const requestLogger = (req, res, next) => {
  if (env.isTest) return next();

  const startedAt = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - startedAt) / 1e6;
    console.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(0)}ms`);
  });

  next();
};
