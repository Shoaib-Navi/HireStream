// Converts the original HireStream schema (v1) to the v2 schema.
// Safe to run again: every step only touches documents that still have v1 fields.
import { slugify } from "../utils/slugify.js";

export const name = "001-v2-schema";

const LEGACY_COLLECTIONS = ["users", "companies", "jobs", "applications"];
const REMOVED_APPLICATIONS = "migration_001_removed_applications";

const LEGACY_APPLICATION_STATUS = {
  pending: "applied",
  accepted: "shortlisted",
  rejected: "rejected",
};

const EMPLOYMENT_TYPE_PATTERNS = [
  [/intern/i, "internship"],
  [/part/i, "part-time"],
  [/contract/i, "contract"],
  [/freelanc/i, "freelance"],
];

const toEmploymentType = (jobType = "") =>
  EMPLOYMENT_TYPE_PATTERNS.find(([pattern]) => pattern.test(jobType))?.[1] ?? "full-time";

const toWorkMode = (...texts) => {
  const text = texts.filter(Boolean).join(" ");
  if (/remote|work from home|wfh/i.test(text)) return "remote";
  if (/hybrid/i.test(text)) return "hybrid";
  return "onsite";
};

const collectionExists = async (db, collectionName) =>
  db.listCollections({ name: collectionName }, { nameOnly: true }).hasNext();

// Full copy of each v1 collection, made once before anything changes
const backupCollections = async (db, log) => {
  for (const collectionName of LEGACY_COLLECTIONS) {
    const backupName = `backup_001_${collectionName}`;
    if (!(await collectionExists(db, collectionName)) || (await collectionExists(db, backupName))) continue;
    await db.collection(collectionName).aggregate([{ $match: {} }, { $out: backupName }]).toArray();
    log(`Backed up ${collectionName} -> ${backupName}`);
  }
};

const migrateUsers = async (db, log) => {
  const users = db.collection("users");
  const profiles = db.collection("candidate_profiles");

  // Emails become case-insensitive in v2, so accounts that differ only by letter case must be resolved first
  const duplicates = await users
    .aggregate([
      { $group: { _id: { $toLower: { $trim: { input: "$email" } } }, count: { $sum: 1 }, emails: { $push: "$email" } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();
  if (duplicates.length > 0) {
    const list = duplicates.map((item) => item.emails.join(" / ")).join("; ");
    throw new Error(`Several accounts share an email in different letter case: ${list}. Merge or rename them and run again.`);
  }

  let migrated = 0;
  for await (const user of users.find({ fullname: { $exists: true } })) {
    const role = user.role === "student" ? "candidate" : user.role;
    const set = {
      fullName: user.fullname,
      email: String(user.email).trim().toLowerCase(),
      role,
      status: "active",
      tokenVersion: 0,
      // existing accounts are treated as verified so they aren't asked to verify again
      emailVerifiedAt: user.createdAt ?? new Date(),
    };
    if (user.phoneNumber !== undefined && user.phoneNumber !== null) set.phone = String(user.phoneNumber);
    if (user.profile?.profilePhoto) set.avatar = { url: user.profile.profilePhoto };

    await users.updateOne({ _id: user._id }, { $set: set, $unset: { fullname: "", phoneNumber: "", profile: "" } });

    if (role === "candidate") {
      const legacyProfile = user.profile ?? {};
      const now = new Date();
      await profiles.updateOne(
        { user: user._id },
        {
          $setOnInsert: {
            user: user._id,
            headline: "",
            bio: legacyProfile.bio ?? "",
            location: "",
            skills: (legacyProfile.skills ?? []).map((skill) => String(skill).trim()).filter(Boolean),
            experience: [],
            education: [],
            isOpenToWork: true,
            ...(legacyProfile.resume && {
              resume: { url: legacyProfile.resume, originalName: legacyProfile.resumeOriginalName || "Resume" },
            }),
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true },
      );
    }
    migrated += 1;
  }
  log(`Users migrated: ${migrated}`);
};

const migrateCompanies = async (db, log) => {
  const companies = db.collection("companies");
  const usedSlugs = new Set(
    (await companies.find({ slug: { $exists: true } }, { projection: { slug: 1 } }).toArray()).map((c) => c.slug),
  );

  let migrated = 0;
  for await (const company of companies.find({ userId: { $exists: true } })) {
    const base = slugify(company.name);
    let slug = base;
    for (let suffix = 2; usedSlugs.has(slug); suffix += 1) slug = `${base}-${suffix}`;
    usedSlugs.add(slug);

    const set = { owner: company.userId, slug, status: "active", isVerified: false };
    const unset = { userId: "" };
    if (typeof company.logo === "string") {
      if (company.logo) set.logo = { url: company.logo };
      else unset.logo = "";
    }

    await companies.updateOne({ _id: company._id }, { $set: set, $unset: unset });
    migrated += 1;
  }

  // v2 allows two companies with the same name (their slugs keep them apart)
  try {
    await companies.dropIndex("name_1");
    log("Dropped unique index on company name");
  } catch {
    // index doesn't exist
  }
  log(`Companies migrated: ${migrated}`);
};

const moveApplications = async (db, applicationsToRemove, reason) => {
  if (applicationsToRemove.length === 0) return;
  await db
    .collection(REMOVED_APPLICATIONS)
    .insertMany(applicationsToRemove.map((application) => ({ ...application, removedReason: reason })));
  await db.collection("applications").deleteMany({ _id: { $in: applicationsToRemove.map((a) => a._id) } });
};

const migrateApplications = async (db, log) => {
  const applications = db.collection("applications");
  const jobs = db.collection("jobs");
  const profiles = db.collection("candidate_profiles");

  // v1 allowed duplicate applications; keep the earliest one of each (job, applicant) pair
  const duplicateGroups = await applications
    .aggregate([
      { $match: { applicant: { $exists: true } } },
      { $sort: { createdAt: 1 } },
      { $group: { _id: { job: "$job", applicant: "$applicant" }, ids: { $push: "$_id" }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();
  const duplicateIds = duplicateGroups.flatMap((group) => group.ids.slice(1));
  const duplicates = await applications.find({ _id: { $in: duplicateIds } }).toArray();
  await moveApplications(db, duplicates, "duplicate");
  if (duplicates.length > 0) log(`Duplicate applications moved to ${REMOVED_APPLICATIONS}: ${duplicates.length}`);

  let migrated = 0;
  const orphans = [];
  for await (const application of applications.find({ applicant: { $exists: true } })) {
    const job = await jobs.findOne({ _id: application.job }, { projection: { company: 1 } });
    if (!job) {
      orphans.push(application);
      continue;
    }

    const status = LEGACY_APPLICATION_STATUS[application.status] ?? "applied";
    const statusHistory = [{ status: "applied", changedAt: application.createdAt ?? new Date() }];
    if (status !== "applied") statusHistory.push({ status, changedAt: application.updatedAt ?? new Date() });

    const profile = await profiles.findOne({ user: application.applicant }, { projection: { resume: 1 } });

    await applications.updateOne(
      { _id: application._id },
      {
        $set: {
          candidate: application.applicant,
          company: job.company,
          status,
          statusHistory,
          coverLetter: "",
          ...(profile?.resume?.url && {
            resume: { url: profile.resume.url, originalName: profile.resume.originalName },
          }),
        },
        $unset: { applicant: "" },
      },
    );
    migrated += 1;
  }

  await moveApplications(db, orphans, "job-deleted");
  if (orphans.length > 0) log(`Applications for deleted jobs moved to ${REMOVED_APPLICATIONS}: ${orphans.length}`);
  log(`Applications migrated: ${migrated}`);
};

const migrateJobs = async (db, log) => {
  const jobs = db.collection("jobs");
  const applications = db.collection("applications");

  let migrated = 0;
  for await (const job of jobs.find({ created_by: { $exists: true } })) {
    const set = {
      employmentType: toEmploymentType(job.jobType),
      workMode: toWorkMode(job.jobType, job.location, job.title),
      experience: { min: Number(job.experienceLevel) || 0, max: null },
      openings: Number(job.position) > 0 ? Number(job.position) : 1,
      postedBy: job.created_by,
      status: "open",
      applicationCount: await applications.countDocuments({ job: job._id }),
      requirements: (job.requirements ?? []).map((item) => String(item).trim()).filter(Boolean),
      responsibilities: [],
      skills: [],
    };
    if (typeof job.salary === "number") {
      set.salary = { min: job.salary, max: job.salary, currency: "INR" };
    }

    await jobs.updateOne(
      { _id: job._id },
      { $set: set, $unset: { jobType: "", experienceLevel: "", position: "", created_by: "", applications: "" } },
    );
    migrated += 1;
  }
  log(`Jobs migrated: ${migrated}`);
};

export const up = async (db, log) => {
  await backupCollections(db, log);
  await migrateUsers(db, log);
  await migrateCompanies(db, log);
  // applications first: jobs count their applications after duplicates and orphans are removed
  await migrateApplications(db, log);
  await migrateJobs(db, log);
};
