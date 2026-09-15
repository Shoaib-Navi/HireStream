import { Application } from "../models/application.js";
import { Job } from "../models/job.js";
import { ApiError } from "../utils/ApiError.js";

const DUPLICATE_KEY_ERROR = 11000;

export const applyJob = async (req, res) => {
  const jobId = req.params.id;

  const jobExists = await Job.exists({ _id: jobId });
  if (!jobExists) {
    throw new ApiError(404, "Job not found");
  }

  const alreadyApplied = await Application.exists({ job: jobId, applicant: req.id });
  if (alreadyApplied) {
    throw new ApiError(409, "You have already applied for this job");
  }

  let application;
  try {
    application = await Application.create({ job: jobId, applicant: req.id });
  } catch (error) {
    // two simultaneous requests: the unique index rejects the second one
    if (error.code === DUPLICATE_KEY_ERROR) {
      throw new ApiError(409, "You have already applied for this job");
    }
    throw error;
  }

  await Job.updateOne({ _id: jobId }, { $push: { applications: application._id } });

  return res.status(201).json({
    message: "Job applied successfully",
    success: true,
  });
};

// Applications of the logged-in student
export const getAppliedJobs = async (req, res) => {
  const applications = await Application.find({ applicant: req.id })
    .sort({ createdAt: -1 })
    .populate({
      path: "job",
      select: "-applications",
      populate: { path: "company", select: "name logo" },
    });

  return res.status(200).json({
    applications,
    success: true,
  });
};

// Applicants for one of the logged-in recruiter's jobs
export const getApplicants = async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, created_by: req.id }).select("title");
  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const applications = await Application.find({ job: job._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "applicant",
      select: "fullname email phoneNumber profile.resume profile.resumeOriginalName",
    });

  return res.status(200).json({
    job: {
      _id: job._id,
      title: job.title,
      applications,
    },
    success: true,
  });
};

export const updateStatus = async (req, res) => {
  const application = await Application.findById(req.params.id).populate({
    path: "job",
    select: "created_by",
  });

  // Only the recruiter who posted the job may change the status
  if (!application || !application.job?.created_by.equals(req.id)) {
    throw new ApiError(404, "Application not found");
  }

  application.status = req.body.status;
  await application.save();

  return res.status(200).json({
    message: "Status updated successfully",
    application: {
      _id: application._id,
      status: application.status,
    },
    success: true,
  });
};
