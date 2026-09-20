import { env } from "../config/env.js";

export const requestLogger = (req, res, next) => {
  if (env.isTest) return next();

  const startedAt = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - startedAt) / 1e6;
    console.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(0)}ms`);
  });

  next();
};
