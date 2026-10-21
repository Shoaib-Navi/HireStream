import { COMPANY_STATUS, JOB_STATUS, ROLES } from "../../constants/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { escapeRegex } from "../../utils/escapeRegex.js";
import { paginationMeta, toPagination } from "../../utils/pagination.js";
import { Application } from "../applications/application.model.js";
import { Company } from "../companies/company.model.js";
import { SavedJob } from "../savedJobs/savedJob.model.js";
import { CandidateProfile } from "../users/candidateProfile.model.js";
import { CARD_COMPANY_FIELDS, toJobCard } from "./job.presenter.js";
import { Job } from "./job.model.js";
import { calculateMatch } from "./matchScore.js";

const DETAIL_COMPANY_FIELDS = "name slug logo location industry size website description isVerified status";

export const isAcceptingApplications = (job) =>
  job.status === JOB_STATUS.OPEN && (!job.deadline || new Date(job.deadline) >= new Date());

// Which of these jobs the viewer has saved (always empty for guests and recruiters)
const savedJobIdsFor = async (viewer, jobIds) => {
  if (viewer?.role !== ROLES.CANDIDATE || jobIds.length === 0) return new Set();
  const saved = await SavedJob.find({ user: viewer.id, job: { $in: jobIds } }).select("job").lean();
  return new Set(saved.map((item) => item.job.toString()));
};

// Profile fields used to score how well a job matches the viewer (null for guests and recruiters)
const matchProfileFor = async (viewer) =>
  viewer?.role === ROLES.CANDIDATE
    ? CandidateProfile.findOne({ user: viewer.id }).select("skills experienceYears location preferences").lean()
    : null;

// Other recruiters' jobs also return 404, so job ids can't be probed
const findOwnedJob = async (recruiterId, jobId) => {
  const job = await Job.findById(jobId);
  if (!job || !job.postedBy.equals(recruiterId)) {
    throw ApiError.notFound("Job not found");
  }
  return job;
};

const assertActiveOwnedCompany = async (recruiterId, companyId) => {
  const company = await Company.findOne({ _id: companyId, owner: recruiterId }).select("status");
  if (!company) {
    throw ApiError.notFound("Company not found. Please register the company before posting a job.");
  }
  if (company.status === COMPANY_STATUS.SUSPENDED) {
    throw ApiError.forbidden("This company is suspended and can't post jobs");
  }
};

export const listPublicJobs = async (query, viewer) => {
  const { q, location, employmentType, workMode, experience, salaryMin, company, sort } = query;
  const { page, limit, skip } = toPagination(query);

  const suspendedCompanyIds = await Company.find({ status: COMPANY_STATUS.SUSPENDED }).distinct("_id");

  const conditions = [
    { status: JOB_STATUS.OPEN },
    { $or: [{ deadline: null }, { deadline: { $gte: new Date() } }] },
  ];
  if (suspendedCompanyIds.length > 0) conditions.push({ company: { $nin: suspendedCompanyIds } });
  if (company) conditions.push({ company });
  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    conditions.push({ $or: [{ title: pattern }, { skills: pattern }, { description: pattern }] });
  }
  if (location) conditions.push({ location: new RegExp(escapeRegex(location), "i") });
  if (employmentType?.length) conditions.push({ employmentType: { $in: employmentType } });
  if (workMode?.length) conditions.push({ workMode: { $in: workMode } });
  if (experience !== undefined) conditions.push({ "experience.min": { $lte: experience } });
  if (salaryMin !== undefined) conditions.push({ "salary.max": { $gte: salaryMin } });

  const filter = { $and: conditions };
  const sortBy = sort === "salary" ? { "salary.max": -1, createdAt: -1 } : { createdAt: -1 };

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .select("-requirements -responsibilities")
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .populate({ path: "company", select: CARD_COMPANY_FIELDS })
      .lean(),
    Job.countDocuments(filter),
  ]);

  const [savedIds, profile] = await Promise.all([
    savedJobIdsFor(viewer, jobs.map((job) => job._id)),
    matchProfileFor(viewer),
  ]);

  return {
    jobs: jobs.map((job) => ({
      ...toJobCard(job),
      isSaved: savedIds.has(job._id.toString()),
      match: calculateMatch(job, profile),
    })),
    meta: paginationMeta({ page, limit }, total),
  };
};

export const getJobDetails = async (jobId, viewer) => {
  const job = await Job.findById(jobId).populate({ path: "company", select: DETAIL_COMPANY_FIELDS }).lean();
  if (!job) {
    throw ApiError.notFound("Job not found");
  }

  const isOwner = viewer?.id === job.postedBy.toString();
  const isAdmin = viewer?.role === ROLES.ADMIN;
  const hiddenFromPublic = job.status === JOB_STATUS.DRAFT || job.company?.status === COMPANY_STATUS.SUSPENDED;
  if (hiddenFromPublic && !isOwner && !isAdmin) {
    throw ApiError.notFound("Job not found");
  }

  const [hasApplied, isSaved, profile] =
    viewer?.role === ROLES.CANDIDATE
      ? await Promise.all([
          Application.exists({ job: job._id, candidate: viewer.id }),
          SavedJob.exists({ job: job._id, user: viewer.id }),
          matchProfileFor(viewer),
        ])
      : [false, false, null];

  return {
    ...job,
    hasApplied: Boolean(hasApplied),
    isSaved: Boolean(isSaved),
    match: calculateMatch(job, profile),
    isOwner,
    isAcceptingApplications: isAcceptingApplications(job),
  };
};

export const createJob = async (recruiterId, { companyId, ...fields }) => {
  await assertActiveOwnedCompany(recruiterId, companyId);
  return Job.create({ ...fields, company: companyId, postedBy: recruiterId });
};

export const updateJob = async (recruiterId, jobId, { companyId, ...updates }) => {
  const job = await findOwnedJob(recruiterId, jobId);

  if (companyId && !job.company.equals(companyId)) {
    await assertActiveOwnedCompany(recruiterId, companyId);
    job.company = companyId;
    // applications keep a copy of the company for recruiter queries
    await Application.updateMany({ job: job._id }, { company: companyId });
  }

  job.set(updates);
  await job.save();
  return job;
};

export const updateJobStatus = async (recruiterId, jobId, status) => {
  const job = await findOwnedJob(recruiterId, jobId);

  if (status === JOB_STATUS.OPEN && job.deadline && job.deadline < new Date()) {
    throw ApiError.badRequest("The application deadline has passed. Set a new deadline before opening this job.");
  }
  if (status === JOB_STATUS.DRAFT && job.applicationCount > 0) {
    throw ApiError.badRequest("Jobs with applicants can't go back to draft. Close the job instead.");
  }

  job.status = status;
  job.closedAt = status === JOB_STATUS.CLOSED ? new Date() : undefined;
  await job.save();
  return job;
};

// Jobs with applicants are closed instead, so candidates keep their application history
export const deleteJob = async (recruiterId, jobId) => {
  const job = await findOwnedJob(recruiterId, jobId);

  const hasApplications = await Application.exists({ job: job._id });
  if (hasApplications) {
    throw ApiError.conflict("This job has applicants, so it can't be deleted. Close it instead.");
  }

  await Promise.all([Job.deleteOne({ _id: job._id }), SavedJob.deleteMany({ job: job._id })]);
};

export const listRecruiterJobs = async (recruiterId, query) => {
  const { page, limit, skip } = toPagination(query);
  const filter = { postedBy: recruiterId, ...(query.status && { status: query.status }) };

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .select("-description -requirements -responsibilities")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "company", select: "name slug logo" })
      .lean(),
    Job.countDocuments(filter),
  ]);

  return { jobs, meta: paginationMeta({ page, limit }, total) };
};
