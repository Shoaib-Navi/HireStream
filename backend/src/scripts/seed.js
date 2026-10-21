// Usage: npm run seed              creates or refreshes local development data
//        npm run seed -- --reset   empties every collection first
//
// The seed is idempotent: running it twice leaves the same rows, because every record is
// matched on a natural key (user email, company slug, job source + external id) and updated
// in place rather than inserted again.
//
// Two kinds of data land in the database, and each row says which it is:
//   PUBLIC_SOURCE  postings fetched from companies' public job boards by `npm run fetch:jobs`,
//                  keeping the board's id, URL and publish date
//   SYNTHETIC      companies, recruiters, candidates and job posts written for demos in
//                  src/data/synthetic-jobs.js. They describe no real employer or vacancy.
//
// It refuses to run against anything that is not a local database, so production is safe.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { APPLICATION_STATUS, DATA_SOURCES, NOTIFICATION_TYPES, ROLES } from "../constants/index.js";
import { runMigrations } from "../migrations/runner.js";
import { allModels } from "../models.js";
import { Application } from "../modules/applications/application.model.js";
import { hashPassword } from "../modules/auth/auth.service.js";
import { Company } from "../modules/companies/company.model.js";
import { Job } from "../modules/jobs/job.model.js";
import { Notification } from "../modules/notifications/notification.model.js";
import { SavedJob } from "../modules/savedJobs/savedJob.model.js";
import { CandidateProfile } from "../modules/users/candidateProfile.model.js";
import { User } from "../modules/users/user.model.js";
import { slugify } from "../utils/slugify.js";
import {
  CANDIDATES,
  COMPANIES,
  JOBS,
  RECRUITERS,
  SYNTHETIC_PASSWORD,
  describeJob,
  jobExtras,
} from "../data/synthetic-jobs.js";

const shouldReset = process.argv.includes("--reset");
const allowRemote = process.argv.includes("--allow-remote");

const PUBLIC_JOBS_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "public-jobs.json");
const RESUME_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
const DAY = 24 * 60 * 60 * 1000;

// The public boards have no recruiter behind them, but the schema needs an owner, so one
// clearly synthetic account holds them. Its jobs stay marked PUBLIC_SOURCE.
const BOARD_DESK = { fullName: "Job Board Desk", email: "boarddesk@hirestream.dev", phone: "+91 90000 00000" };

// Local dev needs an admin to open the admin panel; `npm run create-admin` is for real deployments
const ADMIN = { fullName: "Site Admin", email: "admin@hirestream.dev", phone: "+91 90000 00009" };

const assertLocalDatabase = () => {
  if (env.isProduction) {
    throw new Error("Refusing to seed a production database");
  }
  const isLocal = /^mongodb:\/\/(localhost|127\.0\.0\.1)[:/]/.test(env.mongoUri);
  if (!isLocal && !allowRemote) {
    throw new Error(
      "MONGO_URI does not point at a local database. Seeding refused.\n" +
        "Point MONGO_URI at localhost, or pass --allow-remote if you really mean it.",
    );
  }
};

const readPublicJobs = () => {
  if (!fs.existsSync(PUBLIC_JOBS_FILE)) {
    console.log("No public-jobs.json found. Seeding synthetic data only — run `npm run fetch:jobs` to add real postings.");
    return { companies: [], jobs: [] };
  }
  return JSON.parse(fs.readFileSync(PUBLIC_JOBS_FILE, "utf8"));
};

const upsertUser = (doc) =>
  User.findOneAndUpdate({ email: doc.email }, { $set: doc }, { upsert: true, new: true, setDefaultsOnInsert: true });

const upsertCompany = (doc) =>
  Company.findOneAndUpdate({ slug: doc.slug }, { $set: doc }, { upsert: true, new: true, setDefaultsOnInsert: true });

// Matched on source + externalId, which is what the unique index on Job enforces
const upsertJob = ({ createdAt, ...doc }) =>
  Job.findOneAndUpdate(
    { source: doc.source, externalId: doc.externalId },
    { $set: { ...doc, createdAt, updatedAt: createdAt } },
    { upsert: true, new: true, setDefaultsOnInsert: true, timestamps: false },
  );

const run = async () => {
  assertLocalDatabase();
  await connectDB();
  await runMigrations({ log: () => {} });

  if (shouldReset) {
    await Promise.all(allModels.map((model) => model.deleteMany({})));
    console.log("Existing data removed");
  }

  const password = await hashPassword(SYNTHETIC_PASSWORD);
  const now = Date.now();
  const publicData = readPublicJobs();

  // ── People ────────────────────────────────────────────────────────────────
  const recruiters = [];
  for (const recruiter of RECRUITERS) {
    recruiters.push(
      await upsertUser({
        ...recruiter,
        role: ROLES.RECRUITER,
        password,
        emailVerifiedAt: new Date(),
        source: DATA_SOURCES.SYNTHETIC,
      }),
    );
  }

  const boardDesk = await upsertUser({
    ...BOARD_DESK,
    role: ROLES.RECRUITER,
    password,
    emailVerifiedAt: new Date(),
    source: DATA_SOURCES.SYNTHETIC,
  });

  const admin = await upsertUser({
    ...ADMIN,
    role: ROLES.ADMIN,
    password,
    emailVerifiedAt: new Date(),
    source: DATA_SOURCES.SYNTHETIC,
  });

  const candidates = [];
  for (const [index, candidate] of CANDIDATES.entries()) {
    const user = await upsertUser({
      fullName: candidate.fullName,
      email: candidate.email,
      role: ROLES.CANDIDATE,
      password,
      phone: `+91 91111 1111${index}`,
      emailVerifiedAt: new Date(),
      source: DATA_SOURCES.SYNTHETIC,
    });
    candidates.push(user);

    await CandidateProfile.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          headline: candidate.headline,
          skills: candidate.skills,
          experienceYears: candidate.experienceYears,
          location: candidate.location,
          bio: `${candidate.headline} who likes small teams, clear problems and shipping often.`,
          resume: { url: RESUME_URL, originalName: "resume.pdf", uploadedAt: new Date() },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  // ── Synthetic companies and jobs ──────────────────────────────────────────
  const syntheticCompanies = [];
  for (const [index, company] of COMPANIES.entries()) {
    syntheticCompanies.push(
      await upsertCompany({
        ...company,
        slug: slugify(company.name),
        owner: recruiters[index % recruiters.length]._id,
        isVerified: index % 2 === 0,
        source: DATA_SOURCES.SYNTHETIC,
      }),
    );
  }

  const syntheticJobs = [];
  for (const [index, job] of JOBS.entries()) {
    const company = syntheticCompanies[job.company];
    const postedAt = new Date(now - (index % 30) * DAY);
    syntheticJobs.push(
      await upsertJob({
        source: DATA_SOURCES.SYNTHETIC,
        // Stable id so re-seeding updates the same row
        externalId: `synthetic-${company.slug}-${slugify(job.title)}`,
        title: job.title,
        description: describeJob(job.title, company.name, job.skills),
        ...jobExtras(job.experience, job.skills),
        skills: job.skills,
        employmentType: job.employmentType,
        workMode: job.workMode,
        location: job.location,
        experience: job.experience,
        salary: { ...job.salary, currency: "INR" },
        openings: (index % 3) + 1,
        company: company._id,
        postedBy: company.owner,
        postedAt,
        createdAt: postedAt,
      }),
    );
  }

  // ── Public-source companies and jobs ──────────────────────────────────────
  const publicCompaniesByToken = new Map();
  for (const company of publicData.companies ?? []) {
    const saved = await upsertCompany({
      name: company.name,
      slug: slugify(company.name),
      // Left empty on purpose: the board API publishes no company profile, and inventing one
      // would put made-up words in a real company's mouth
      description: "",
      website: "",
      location: "",
      owner: boardDesk._id,
      isVerified: false,
      source: DATA_SOURCES.PUBLIC_SOURCE,
      sourceUrl: company.sourceUrl,
      externalId: company.boardToken,
    });
    publicCompaniesByToken.set(company.boardToken, saved);
  }

  const publicJobs = [];
  for (const job of publicData.jobs ?? []) {
    const company = publicCompaniesByToken.get(job.boardToken);
    if (!company) continue;
    const postedAt = job.postedAt ? new Date(job.postedAt) : new Date(now);

    publicJobs.push(
      await upsertJob({
        source: DATA_SOURCES.PUBLIC_SOURCE,
        externalId: job.externalId,
        title: job.title,
        description: job.description,
        requirements: [],
        responsibilities: [],
        skills: job.skills ?? [],
        employmentType: job.employmentType,
        workMode: job.workMode,
        location: job.location,
        experience: { min: job.experience?.min ?? 0, max: job.experience?.max ?? undefined },
        // The board API exposes no structured pay range, so salary stays empty
        openings: 1,
        company: company._id,
        postedBy: boardDesk._id,
        postedAt,
        createdAt: postedAt,
        sourceUrl: job.sourceUrl,
      }),
    );
  }

  const allJobs = [...syntheticJobs, ...publicJobs];

  // ── Applications and saved jobs ───────────────────────────────────────────
  const PIPELINE = [
    APPLICATION_STATUS.APPLIED,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.OFFERED,
    APPLICATION_STATUS.HIRED,
    APPLICATION_STATUS.REJECTED,
  ];

  // Spread applications across candidates and across both kinds of job
  const applicationPlan = candidates.flatMap((candidate, candidateIndex) =>
    [0, 1, 2, 3].map((offset) => {
      const job = allJobs[(candidateIndex * 5 + offset * 3) % allJobs.length];
      return { candidate, job, status: PIPELINE[(candidateIndex + offset) % PIPELINE.length] };
    }),
  );

  const seededApplications = [];
  for (const { candidate, job, status } of applicationPlan) {
    const history = [{ status: APPLICATION_STATUS.APPLIED, changedBy: candidate._id }];
    if (status !== APPLICATION_STATUS.APPLIED) {
      history.push({ status, changedBy: job.postedBy, note: "Thanks for applying — we've moved your application forward." });
    }

    const application = await Application.findOneAndUpdate(
      { job: job._id, candidate: candidate._id },
      {
        $set: {
          company: job.company,
          status,
          statusHistory: history,
          resume: { url: RESUME_URL, originalName: "resume.pdf" },
          coverLetter: `I'd love to work on ${job.title}. My background lines up well with what you're looking for.`,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    seededApplications.push({ application, candidate, job, status });
  }

  // Give the notification bell something to show, matched on the link so re-seeding is safe
  for (const { application, candidate, job, status } of seededApplications.slice(0, 8)) {
    const recruiterLink = `/recruiter/applications/${application._id}`;
    await Notification.findOneAndUpdate(
      { user: job.postedBy, link: recruiterLink, type: NOTIFICATION_TYPES.APPLICATION_RECEIVED },
      {
        $set: {
          title: `New applicant for ${job.title}`,
          body: `${candidate.fullName} applied.`,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (status !== APPLICATION_STATUS.APPLIED) {
      const candidateLink = `/dashboard/applications/${application._id}`;
      await Notification.findOneAndUpdate(
        { user: candidate._id, link: candidateLink, type: NOTIFICATION_TYPES.APPLICATION_STATUS },
        {
          $set: {
            title: `Your application for ${job.title} moved to ${status}`,
            body: "Open the application to see the full history.",
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }
  }

  for (const [index, candidate] of candidates.entries()) {
    for (const offset of [1, 4, 7]) {
      const job = allJobs[(index * 7 + offset) % allJobs.length];
      await SavedJob.findOneAndUpdate(
        { user: candidate._id, job: job._id },
        { $setOnInsert: { user: candidate._id, job: job._id } },
        { upsert: true, new: true },
      );
    }
  }

  // Recomputed rather than incremented, so re-running the seed keeps the counts correct
  const counts = await Application.aggregate([{ $group: { _id: "$job", count: { $sum: 1 } } }]);
  await Job.updateMany({}, { applicationCount: 0 }, { timestamps: false });
  for (const { _id, count } of counts) {
    await Job.updateOne({ _id }, { applicationCount: count }, { timestamps: false });
  }

  const [publicJobCount, syntheticJobCount, applicationCount, savedCount, notificationCount] = await Promise.all([
    Job.countDocuments({ source: DATA_SOURCES.PUBLIC_SOURCE }),
    Job.countDocuments({ source: DATA_SOURCES.SYNTHETIC }),
    Application.countDocuments(),
    SavedJob.countDocuments(),
    Notification.countDocuments(),
  ]);

  console.log("");
  console.log(`Users         ${recruiters.length + candidates.length + 2} (all SYNTHETIC)`);
  console.log(`Companies     ${syntheticCompanies.length} SYNTHETIC + ${publicCompaniesByToken.size} PUBLIC_SOURCE`);
  console.log(`Jobs          ${syntheticJobCount} SYNTHETIC + ${publicJobCount} PUBLIC_SOURCE`);
  console.log(`Applications  ${applicationCount}`);
  console.log(`Saved jobs    ${savedCount}`);
  console.log(`Notifications ${notificationCount}`);
  if (publicData.fetchedAt) {
    console.log(`\nPublic postings fetched ${publicData.fetchedAt} from ${publicData.provider}.`);
  }
  console.log(`\nLog in with any seeded email and the password "${SYNTHETIC_PASSWORD}",`);
  console.log(`for example ${RECRUITERS[0].email} (recruiter) or ${CANDIDATES[0].email} (job seeker).`);
  console.log(`The admin panel is at /admin, signed in as ${admin.email}.`);
};

try {
  await run();
  await disconnectDB();
} catch (error) {
  console.error("Seeding failed:", error.message);
  await disconnectDB();
  process.exit(1);
}
