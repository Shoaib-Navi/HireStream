import { APPLICATION_STATUS, JOB_STATUS, ROLES, USER_STATUS } from "../../constants/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { escapeRegex } from "../../utils/escapeRegex.js";
import { paginationMeta, toPagination } from "../../utils/pagination.js";
import { Application } from "../applications/application.model.js";
import { Company } from "../companies/company.model.js";
import { Job } from "../jobs/job.model.js";
import { SavedJob } from "../savedJobs/savedJob.model.js";
import { User } from "../users/user.model.js";

const RECENT_LIMIT = 5;

const countsByKey = (rows) => Object.fromEntries(rows.map((row) => [row._id, row.count]));

const groupCount = (model, field, match = {}) =>
  model.aggregate([{ $match: match }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }]);

// Zero-filled counts, so the dashboard shows every status even before it's used
const withDefaults = (values, counts) =>
  Object.fromEntries(values.map((value) => [value, counts[value] ?? 0]));

export const getPlatformOverview = async () => {
  const [usersByRole, usersByStatus, jobsByStatus, applicationsByStatus, companies, unverifiedCompanies, recentUsers, recentJobs] =
    await Promise.all([
      groupCount(User, "role"),
      groupCount(User, "status"),
      groupCount(Job, "status"),
      groupCount(Application, "status"),
      Company.countDocuments(),
      Company.countDocuments({ isVerified: false }),
      User.find().sort({ createdAt: -1 }).limit(RECENT_LIMIT).select("fullName email role avatar createdAt").lean(),
      Job.find()
        .sort({ createdAt: -1 })
        .limit(RECENT_LIMIT)
        .select("title status applicationCount createdAt company")
        .populate({ path: "company", select: "name slug logo" })
        .lean(),
    ]);

  const applicationCounts = countsByKey(applicationsByStatus);

  return {
    users: {
      total: usersByRole.reduce((sum, row) => sum + row.count, 0),
      byRole: withDefaults(Object.values(ROLES), countsByKey(usersByRole)),
      suspended: countsByKey(usersByStatus)[USER_STATUS.SUSPENDED] ?? 0,
    },
    companies: { total: companies, unverified: unverifiedCompanies },
    jobs: {
      total: jobsByStatus.reduce((sum, row) => sum + row.count, 0),
      byStatus: withDefaults(Object.values(JOB_STATUS), countsByKey(jobsByStatus)),
    },
    applications: {
      total: applicationsByStatus.reduce((sum, row) => sum + row.count, 0),
      byStatus: withDefaults(Object.values(APPLICATION_STATUS), applicationCounts),
    },
    recentUsers,
    recentJobs,
  };
};

export const listUsers = async (query) => {
  const { page, limit, skip } = toPagination(query);
  const filter = {
    ...(query.role && { role: query.role }),
    ...(query.status && { status: query.status }),
  };
  if (query.q) {
    const pattern = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [{ fullName: pattern }, { email: pattern }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return { users, meta: paginationMeta({ page, limit }, total) };
};

// Suspending signs the user out everywhere by invalidating their sessions
export const updateUserStatus = async (adminId, userId, status) => {
  if (adminId === userId) {
    throw ApiError.badRequest("You can't change your own status");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  if (user.role === ROLES.ADMIN) {
    throw ApiError.forbidden("Admin accounts can't be suspended from the panel");
  }

  return User.findByIdAndUpdate(
    userId,
    {
      $set: { status },
      ...(status === USER_STATUS.SUSPENDED && { $inc: { tokenVersion: 1 } }),
    },
    { new: true },
  );
};

export const listCompanies = async (query) => {
  const { page, limit, skip } = toPagination(query);
  const filter = {
    ...(query.status && { status: query.status }),
    ...(query.isVerified !== undefined && { isVerified: query.isVerified }),
    ...(query.q && { name: new RegExp(escapeRegex(query.q), "i") }),
  };

  const [companies, total] = await Promise.all([
    Company.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "owner", select: "fullName email" })
      .lean(),
    Company.countDocuments(filter),
  ]);

  const counts = await Job.aggregate([
    { $match: { company: { $in: companies.map((company) => company._id) } } },
    { $group: { _id: "$company", count: { $sum: 1 } } },
  ]);
  const jobCounts = countsByKey(counts);

  return {
    companies: companies.map((company) => ({ ...company, jobCount: jobCounts[company._id.toString()] ?? 0 })),
    meta: paginationMeta({ page, limit }, total),
  };
};

export const updateCompany = async (companyId, updates) => {
  const company = await Company.findByIdAndUpdate(companyId, { $set: updates }, { new: true }).populate({
    path: "owner",
    select: "fullName email",
  });
  if (!company) {
    throw ApiError.notFound("Company not found");
  }
  return company;
};

export const listJobs = async (query) => {
  const { page, limit, skip } = toPagination(query);
  const filter = {
    ...(query.status && { status: query.status }),
    ...(query.q && { title: new RegExp(escapeRegex(query.q), "i") }),
  };

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .select("-description -requirements -responsibilities")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "company", select: "name slug logo status" })
      .populate({ path: "postedBy", select: "fullName email" })
      .lean(),
    Job.countDocuments(filter),
  ]);

  return { jobs, meta: paginationMeta({ page, limit }, total) };
};

export const updateJobStatus = async (jobId, status) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound("Job not found");
  }

  job.status = status;
  job.closedAt = status === JOB_STATUS.CLOSED ? new Date() : undefined;
  await job.save();
  return job;
};

// Same rule as recruiters: jobs with applicants are closed, not deleted, so candidates keep their history
export const deleteJob = async (jobId) => {
  const job = await Job.findById(jobId).select("_id");
  if (!job) {
    throw ApiError.notFound("Job not found");
  }

  const hasApplications = await Application.exists({ job: job._id });
  if (hasApplications) {
    throw ApiError.conflict("This job has applicants, so it can't be deleted. Close it instead.");
  }

  await Promise.all([Job.deleteOne({ _id: job._id }), SavedJob.deleteMany({ job: job._id })]);
};
