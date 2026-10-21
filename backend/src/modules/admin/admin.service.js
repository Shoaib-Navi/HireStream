import { APPLICATION_STATUS, COMPANY_STATUS, JOB_STATUS, ROLES, USER_STATUS } from "../../constants/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { escapeRegex } from "../../utils/escapeRegex.js";
import { countBy, sumCounts } from "../../utils/countBy.js";
import { paginationMeta, toPagination } from "../../utils/pagination.js";
import { Application } from "../applications/application.model.js";
import { Company } from "../companies/company.model.js";
import { Job } from "../jobs/job.model.js";
import { removeJob, setJobStatus } from "../jobs/jobs.service.js";
import { User } from "../users/user.model.js";

const RECENT_LIMIT = 5;

// Zero-filled counts, so the dashboard shows every status even before it's used
const withDefaults = (values, counts) =>
  Object.fromEntries(values.map((value) => [value, counts[value] ?? 0]));

export const getPlatformOverview = async () => {
  const [usersByRole, usersByStatus, jobsByStatus, applicationsByStatus, companies, unverifiedCompanies, recentUsers, recentJobs] =
    await Promise.all([
      countBy(User, "role"),
      countBy(User, "status"),
      countBy(Job, "status"),
      countBy(Application, "status"),
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

  return {
    users: {
      total: sumCounts(usersByRole),
      byRole: withDefaults(Object.values(ROLES), usersByRole),
      suspended: usersByStatus[USER_STATUS.SUSPENDED] ?? 0,
    },
    companies: { total: companies, unverified: unverifiedCompanies },
    jobs: {
      total: sumCounts(jobsByStatus),
      byStatus: withDefaults(Object.values(JOB_STATUS), jobsByStatus),
    },
    applications: {
      total: sumCounts(applicationsByStatus),
      byStatus: withDefaults(Object.values(APPLICATION_STATUS), applicationsByStatus),
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

// A job is listed only while both its company and the recruiter who posted it are active,
// so restoring one side leaves hidden the jobs whose other side is still suspended
const setJobsListed = async (scope, listed) => {
  let stillSuspended = {};
  if (listed && scope.company) {
    stillSuspended = { postedBy: { $nin: await User.distinct("_id", { status: USER_STATUS.SUSPENDED }) } };
  } else if (listed) {
    stillSuspended = { company: { $nin: await Company.distinct("_id", { status: COMPANY_STATUS.SUSPENDED }) } };
  }
  await Job.updateMany({ ...scope, ...stillSuspended }, { companyActive: listed });
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

  const updated = await User.findByIdAndUpdate(
    userId,
    {
      $set: { status },
      ...(status === USER_STATUS.SUSPENDED && { $inc: { tokenVersion: 1 } }),
    },
    { new: true },
  );

  if (user.role === ROLES.RECRUITER) {
    await setJobsListed({ postedBy: user._id }, status === USER_STATUS.ACTIVE);
  }
  return updated;
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

  const jobCounts = await countBy(Job, "company", { company: { $in: companies.map((company) => company._id) } });

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
  if (updates.status) {
    await setJobsListed({ company: company._id }, updates.status === COMPANY_STATUS.ACTIVE);
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

  setJobStatus(job, status);
  await job.save();
  return job;
};

export const deleteJob = async (jobId) => {
  const job = await Job.findById(jobId).select("_id");
  if (!job) {
    throw ApiError.notFound("Job not found");
  }
  await removeJob(job);
};
