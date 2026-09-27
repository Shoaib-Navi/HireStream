import express from "express";
import { buildSitemap } from "./sitemap.service.js";

const router = express.Router();

// Served on the frontend domain at /sitemap.xml through a Vercel rewrite
router.get("/", async (req, res) => {
  const xml = await buildSitemap();
  // Shared caches (Vercel's CDN) keep it for an hour, so crawlers don't query the database on every fetch
  res.set("Cache-Control", "public, max-age=0, s-maxage=3600").type("application/xml").send(xml);
});

export default router;
