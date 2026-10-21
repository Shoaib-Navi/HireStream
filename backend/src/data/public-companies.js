// Profile text for the real companies whose public job boards we mirror.
//
// The Greenhouse board API publishes no company profile, so these lines are written here
// rather than fetched. They stay at the level of what the company is widely known to make,
// and deliberately carry no figures, funding, headcount, founding dates or praise: nothing
// that would put a specific claim in a real company's mouth. The postings themselves remain
// PUBLIC_SOURCE and untouched.
//
// Keyed by board token because `npm run fetch:jobs` rewrites public-jobs.json in full and
// would drop anything hand-written there. A token with no entry simply gets no profile.
export const PUBLIC_COMPANY_PROFILES = {
  gitlab: {
    industry: "Developer tools",
    description: "GitLab is a DevOps platform where teams plan, build, review and ship software in one place.",
  },
  figma: {
    industry: "Design software",
    description: "Figma makes browser-based design tools that let product teams draw, prototype and review together.",
  },
  databricks: {
    industry: "Data & analytics",
    description: "Databricks builds a data and AI platform for storing, processing and modelling large datasets.",
  },
  cloudflare: {
    industry: "Internet infrastructure",
    description: "Cloudflare runs a global network that delivers, secures and speeds up sites, APIs and applications.",
  },
  robinhood: {
    industry: "Fintech",
    description: "Robinhood runs a consumer investing app for trading stocks, options, funds and crypto from a phone.",
  },
  discord: {
    industry: "Communication",
    description: "Discord is a voice, video and text chat platform built around communities and their own servers.",
  },
  reddit: {
    industry: "Social media",
    description: "Reddit is a network of user-run communities where people post, discuss and vote on content.",
  },
  twilio: {
    industry: "Communications APIs",
    description: "Twilio provides APIs that let developers add messaging, voice and email to their own applications.",
  },
  mongodb: {
    industry: "Databases",
    description: "MongoDB builds a document database, along with the managed cloud service and tooling teams run it on.",
  },
  elastic: {
    industry: "Search & observability",
    description: "Elastic builds search and observability software, including the Elasticsearch engine and Kibana.",
  },
  gusto: {
    industry: "HR & payroll",
    description: "Gusto handles payroll, benefits, onboarding and hiring paperwork for small and growing businesses.",
  },
  airtable: {
    industry: "Productivity software",
    description: "Airtable is a collaborative platform where teams organise work in linked tables, views and apps.",
  },
  samsara: {
    industry: "IoT & operations",
    description: "Samsara connects vehicles, equipment and sites so operations teams can track fleets and safety.",
  },
  instacart: {
    industry: "E-commerce",
    description: "Instacart runs a grocery delivery and pickup marketplace that connects shoppers with local stores.",
  },
  dropbox: {
    industry: "Cloud storage",
    description: "Dropbox provides cloud file storage and sharing, with tools for syncing and working on documents.",
  },
};
