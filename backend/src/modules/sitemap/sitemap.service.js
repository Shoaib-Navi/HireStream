import { env } from "../../config/env.js";
import { COMPANY_STATUS } from "../../constants/index.js";
import { Company } from "../companies/company.model.js";
import { Job } from "../jobs/job.model.js";
import { publicJobFilter } from "../jobs/jobs.service.js";

// A sitemap file holds at most 50,000 URLs
const MAX_URLS = 50_000;
const STATIC_PATHS = ["/", "/jobs", "/companies"];

const escapeXml = (value) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);

const toUrl = ({ path, updatedAt }) =>
  `<url><loc>${escapeXml(`${env.appUrl}${path}`)}</loc>${updatedAt ? `<lastmod>${updatedAt.toISOString()}</lastmod>` : ""}</url>`;

// Public pages for search engines. Seeded jobs and companies (those with a source) are left out:
// they mirror other employers' listings, which must not be offered to search engines as our own.
export const buildSitemap = async () => {
  const [jobs, companies] = await Promise.all([
    Job.find({ ...publicJobFilter(), source: { $exists: false } })
      .select("updatedAt")
      .sort({ createdAt: -1 })
      .limit(MAX_URLS)
      .lean(),
    Company.find({ status: COMPANY_STATUS.ACTIVE, source: { $exists: false } })
      .select("slug updatedAt")
      .sort({ createdAt: -1 })
      .limit(MAX_URLS)
      .lean(),
  ]);

  const urls = [
    ...STATIC_PATHS.map((path) => ({ path })),
    ...jobs.map((job) => ({ path: `/jobs/${job._id}`, updatedAt: job.updatedAt })),
    ...companies.map((company) => ({ path: `/companies/${company.slug}`, updatedAt: company.updatedAt })),
  ].slice(0, MAX_URLS);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(toUrl),
    "</urlset>",
  ].join("\n");
};
