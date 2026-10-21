import { Application } from "../models/application.js";
import { Company } from "../models/company.js";
import { Job } from "../models/job.js";
import { ApiError } from "../utils/ApiError.js";
import { escapeRegex } from "../utils/escapeRegex.js";

const MAX_KEYWORD_LENGTH = 100;

// Public company fields shown on job cards (hides the owner's user id)
const COMPANY_POPULATE = { path: "company", select: "name description website location logo" };

// Recruiter posts a job for one of their own companies
export const postJob = async (req, res) => {
  const { title, description, requirements, salary, location, jobType, experience, position, companyId } =
    req.body;

  const ownsCompany = await Company.exists({ _id: companyId, userId: req.id });
  if (!ownsCompany) {
    throw new ApiError(404, "Company not found. Please register the company before posting a job.");
  }

  const job = await Job.create({
    title,
    description,
    requirements,
    salary,
    location,
    jobType,
    experienceLevel: experience,
    position,
    company: companyId,
    created_by: req.id,
  });

  return res.status(201).json({
    message: "New job created successfully",
    job,
    success: true,
  });
};

// Public job listing with optional keyword search
export const getAllJobs = async (req, res) => {
  const keyword =
    typeof req.query.keyword === "string" ? req.query.keyword.trim().slice(0, MAX_KEYWORD_LENGTH) : "";

  const filter = {};
  if (keyword) {
    const pattern = new RegExp(escapeRegex(keyword), "i");
    filter.$or = [{ title: pattern }, { description: pattern }, { location: pattern }, { jobType: pattern }];
  }

  const jobs = await Job.find(filter)
    .select("-applications")
    .populate(COMPANY_POPULATE)
    .sort({ createdAt: -1 });

  return res.status(200).json({
    jobs,
    success: true,
  });
};

// Public job details. Individual applications are never exposed, only the count
// and whether the logged-in user has applied.
export const getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id).select("-applications").populate(COMPANY_POPULATE);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const [applicantCount, existingApplication] = await Promise.all([
    Application.countDocuments({ job: job._id }),
    req.id ? Application.exists({ job: job._id, applicant: req.id }) : null,
  ]);

  return res.status(200).json({
    job: {
      ...job.toJSON(),
      applicantCount,
      hasApplied: Boolean(existingApplication),
    },
    success: true,
  });
};

// Jobs posted by the logged-in recruiter
export const getAdminJobs = async (req, res) => {
  const jobs = await Job.find({ created_by: req.id })
    .select("-applications")
    .populate(COMPANY_POPULATE)
    .sort({ createdAt: -1 });

  return res.status(200).json({
    jobs,
    success: true,
  });
};
