// Usage: npm run fetch:jobs [-- --per-company 4]
//
// Downloads postings that companies publish on their public Greenhouse career boards and
// writes them to src/data/public-jobs.json, which `npm run seed` reads. Run it again to
// refresh the file; nothing here touches a database.
//
// Every job keeps the board's own id, URL and publish date, so seeded records can always be
// traced back to the posting they came from. Greenhouse does not expose work mode, employment
// type, experience or skills as structured fields, so those are DERIVED from the title and
// location (see the helpers below) and should be treated as approximations, not as facts from
// the employer. Salary is left empty because the board API does not provide a structured range.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BOARD_TOKENS = [
  "gitlab",
  "figma",
  "databricks",
  "cloudflare",
  "robinhood",
  "discord",
  "reddit",
  "twilio",
  "mongodb",
  "elastic",
  "gusto",
  "airtable",
  "samsara",
  "instacart",
  "dropbox",
];

const API = "https://boards-api.greenhouse.io/v1/boards";
const OUTPUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "public-jobs.json");

const perCompanyArg = process.argv.indexOf("--per-company");
const PER_COMPANY = perCompanyArg > -1 ? Number(process.argv[perCompanyArg + 1]) || 4 : 4;

const MAX_DESCRIPTION = 900;
const MAX_TITLE = 120;
const MAX_LOCATION = 100;

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " ", "&#x27;": "'" };

// Greenhouse returns the description as escaped HTML; keep a short plain-text excerpt
const toExcerpt = (html = "") => {
  const text = html
    .replace(/&(amp|lt|gt|quot|nbsp|#39|#x27);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > MAX_DESCRIPTION ? `${text.slice(0, MAX_DESCRIPTION).trimEnd()}…` : text;
};

// DERIVED from the location text the board publishes
const deriveWorkMode = (location = "") => {
  const value = location.toLowerCase();
  if (value.includes("hybrid")) return "hybrid";
  if (value.includes("remote") || value.includes("anywhere")) return "remote";
  return "onsite";
};

// DERIVED from the job title
const deriveEmploymentType = (title = "") => {
  const value = title.toLowerCase();
  if (value.includes("intern") && !value.includes("internal")) return "internship";
  if (value.includes("contract") || value.includes("temporary")) return "contract";
  if (value.includes("part-time") || value.includes("part time")) return "part-time";
  return "full-time";
};

// DERIVED from seniority words in the title; absent words mean "unspecified", not "none"
const deriveExperience = (title = "") => {
  const value = title.toLowerCase();
  if (value.includes("intern")) return { min: 0, max: 1 };
  if (value.includes("principal") || value.includes("staff") || value.includes("director")) return { min: 8, max: null };
  if (value.includes("senior") || value.includes("sr.") || value.includes("lead")) return { min: 5, max: null };
  if (value.includes("junior") || value.includes("associate") || value.includes("entry")) return { min: 0, max: 2 };
  return { min: 0, max: null };
};

const SKILL_KEYWORDS = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "Go", "Ruby", "Rust", "PHP", "Swift", "Kotlin",
  "GraphQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Kafka", "Elasticsearch", "AWS", "GCP", "Azure", "Docker",
  "Kubernetes", "Terraform", "CI/CD", "Figma", "SQL", "Tableau", "Salesforce", "Machine Learning", "Security",
];

// DERIVED by matching a keyword list against the title and excerpt
const deriveSkills = (title, description) => {
  const haystack = `${title} ${description}`.toLowerCase();
  return SKILL_KEYWORDS.filter((skill) => haystack.includes(skill.toLowerCase())).slice(0, 8);
};

// Spreads the picks across the board instead of taking the first few, which are often one team
const spread = (items, count) => {
  if (items.length <= count) return items;
  const step = Math.floor(items.length / count);
  return Array.from({ length: count }, (_, index) => items[index * step]);
};

const fetchJson = async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
};

const fetchBoard = async (token) => {
  const [board, listing] = await Promise.all([
    fetchJson(`${API}/${token}`),
    fetchJson(`${API}/${token}/jobs?content=true`),
  ]);

  const jobs = spread(listing.jobs ?? [], PER_COMPANY).map((job) => {
    const description = toExcerpt(job.content);
    const title = String(job.title ?? "").slice(0, MAX_TITLE);
    const location = String(job.location?.name ?? "").slice(0, MAX_LOCATION) || "Not specified";

    return {
      boardToken: token,
      externalId: String(job.id),
      title,
      location,
      workMode: deriveWorkMode(location),
      employmentType: deriveEmploymentType(title),
      experience: deriveExperience(title),
      skills: deriveSkills(title, description),
      description,
      sourceUrl: job.absolute_url,
      postedAt: job.first_published ?? job.updated_at ?? null,
    };
  });

  return {
    company: {
      boardToken: token,
      name: board.name ?? token,
      sourceUrl: `https://job-boards.greenhouse.io/${token}`,
    },
    jobs: jobs.filter((job) => job.title && job.description),
  };
};

const run = async () => {
  const companies = [];
  const jobs = [];

  for (const token of BOARD_TOKENS) {
    try {
      const board = await fetchBoard(token);
      if (board.jobs.length === 0) {
        console.log(`- ${token}: no usable postings`);
        continue;
      }
      companies.push(board.company);
      jobs.push(...board.jobs);
      console.log(`✓ ${token}: ${board.jobs.length} postings`);
    } catch (error) {
      console.log(`- ${token}: skipped (${error.message})`);
    }
  }

  const payload = {
    provider: "greenhouse",
    providerApi: API,
    fetchedAt: new Date().toISOString(),
    note: "Fetched from public company job boards. Work mode, employment type, experience and skills are derived from the title and location, not published by the employer. Salary is not exposed by this API.",
    companies,
    jobs,
  };

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`\nWrote ${jobs.length} postings from ${companies.length} companies to ${path.relative(process.cwd(), OUTPUT)}`);
};

try {
  await run();
} catch (error) {
  console.error("Fetch failed:", error.message);
  process.exit(1);
}
