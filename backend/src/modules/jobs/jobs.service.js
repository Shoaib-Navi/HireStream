import { COMPANY_STATUS, JOB_STATUS, ROLES } from "../../constants/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { escapeRegex } from "../../utils/escapeRegex.js";
import { paginationMeta, toPagination } from "../../utils/pagination.js";
import { Application } from "../applications/application.model.js";
import { Company } from "../companies/company.model.js";
import { Job } from "./job.model.js";

const CARD_COMPANY_FIELDS = "name slug logo location isVerified";
const DETAIL_COMPANY_FIELDS = "name slug logo location industry size website description isVerified status";
const SUMMARY_LENGTH = 220;

// Job cards only need a short summary instead of the full description
const toJobCard = ({ description, ...job }) => ({
  ...job,
  summary: description.length > SUMMARY_LENGTH ? `${description.slice(0, SUMMARY_LENGTH).trimEnd()}…` : description,
});

export const isAcceptingApplications = (job) =>
  job.status === JOB_STATUS.OPEN && (!job.deadline || new Date(job.deadline) >= new Date());

export const listPublicJobs = async (query) => {
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

  return { jobs: jobs.map(toJobCard), meta: paginationMeta({ page, limit }, total) };
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

  const hasApplied =
    viewer?.role === ROLES.CANDIDATE
      ? Boolean(await Application.exists({ job: job._id, candidate: viewer.id }))
      : false;

  return {
    ...job,
    hasApplied,
    isOwner,
    isAcceptingApplications: isAcceptingApplications(job),
  };
};

export const createJob = async (recruiterId, { companyId, ...fields }) => {
  const company = await Company.findOne({ _id: companyId, owner: recruiterId }).select("status");
  if (!company) {
    throw ApiError.notFound("Company not found. Please register the company before posting a job.");
  }
  if (company.status === COMPANY_STATUS.SUSPENDED) {
    throw ApiError.forbidden("This company is suspended and can't post jobs");
  }
  return Job.create({ ...fields, company: companyId, postedBy: recruiterId });
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
