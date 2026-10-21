import { APPLICATION_STATUS, COMPANY_STATUS, ROLES } from "../../constants/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { paginationMeta, toPagination } from "../../utils/pagination.js";
import { Job } from "../jobs/job.model.js";
import { isAcceptingApplications } from "../jobs/jobs.service.js";
import { CandidateProfile } from "../users/candidateProfile.model.js";
import { Application } from "./application.model.js";

const DUPLICATE_KEY_ERROR = 11000;

const CANDIDATE_CARD_FIELDS = "fullName email phone avatar";
const PROFILE_SUMMARY_FIELDS = "user headline location skills experienceYears links";

export const applyToJob = async (candidateId, jobId, { coverLetter }) => {
  const job = await Job.findById(jobId).select("status deadline company").populate({ path: "company", select: "status" });
  if (!job || job.company?.status === COMPANY_STATUS.SUSPENDED) {
    throw ApiError.notFound("Job not found");
  }
  if (!isAcceptingApplications(job)) {
    throw ApiError.badRequest("This job is no longer accepting applications");
  }

  const profile = await CandidateProfile.findOne({ user: candidateId }).select("resume").lean();
  if (!profile?.resume?.url) {
    throw ApiError.badRequest("Please upload your resume before applying");
  }

  let application;
  try {
    application = await Application.create({
      job: job._id,
      candidate: candidateId,
      company: job.company._id,
      coverLetter,
      resume: { url: profile.resume.url, originalName: profile.resume.originalName },
      statusHistory: [{ status: APPLICATION_STATUS.APPLIED, changedBy: candidateId }],
    });
  } catch (error) {
    // also covers two simultaneous requests: the unique index rejects the second one
    if (error.code === DUPLICATE_KEY_ERROR) {
      throw ApiError.conflict("You have already applied for this job");
    }
    throw error;
  }

  await Job.updateOne({ _id: job._id }, { $inc: { applicationCount: 1 } });
  return application;
};

export const listCandidateApplications = async (candidateId, query) => {
  const { page, limit, skip } = toPagination(query);
  const filter = { candidate: candidateId, ...(query.status && { status: query.status }) };

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .select("-coverLetter")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "job", select: "title location employmentType workMode status salary" })
      .populate({ path: "company", select: "name slug logo" })
      .lean(),
    Application.countDocuments(filter),
  ]);

  return { applications, meta: paginationMeta({ page, limit }, total) };
};

export const listJobApplications = async (recruiterId, jobId, query) => {
  const job = await Job.findOne({ _id: jobId, postedBy: recruiterId }).select("title status applicationCount").lean();
  if (!job) {
    throw ApiError.notFound("Job not found");
  }

  const { page, limit, skip } = toPagination(query);
  const filter = { job: job._id, ...(query.status && { status: query.status }) };

  const [applications, total, statusCounts] = await Promise.all([
    Application.find(filter)
      .select("-statusHistory")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "candidate", select: CANDIDATE_CARD_FIELDS })
      .lean(),
    Application.countDocuments(filter),
    Application.aggregate([{ $match: { job: job._id } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const candidateIds = applications.map((application) => application.candidate?._id).filter(Boolean);
  const profiles = await CandidateProfile.find({ user: { $in: candidateIds } }).select(PROFILE_SUMMARY_FIELDS).lean();
  const profileByUser = new Map(profiles.map((profile) => [profile.user.toString(), profile]));

  return {
    job,
    applications: applications.map((application) => ({
      ...application,
      candidateProfile: profileByUser.get(application.candidate?._id.toString()) ?? null,
    })),
    statusCounts: Object.fromEntries(statusCounts.map((item) => [item._id, item.count])),
    meta: paginationMeta({ page, limit }, total),
  };
};

// Visible to the candidate who applied, the recruiter who posted the job, and admins
export const getApplication = async (applicationId, viewer) => {
  const application = await Application.findById(applicationId)
    .populate({ path: "job", select: "title location employmentType workMode status postedBy" })
    .populate({ path: "company", select: "name slug logo" })
    .populate({ path: "candidate", select: CANDIDATE_CARD_FIELDS })
    .lean();

  const isCandidate = application?.candidate?._id.toString() === viewer.id;
  const isRecruiter = application?.job?.postedBy?.toString() === viewer.id;
  if (!application || (!isCandidate && !isRecruiter && viewer.role !== ROLES.ADMIN)) {
    throw ApiError.notFound("Application not found");
  }

  if (isCandidate) {
    return application;
  }
  const candidateProfile = await CandidateProfile.findOne({ user: application.candidate?._id }).lean();
  return { ...application, candidateProfile };
};

export const updateApplicationStatus = async (recruiterId, applicationId, { status, note }) => {
  const application = await Application.findById(applicationId).populate({ path: "job", select: "postedBy" });
  if (!application || !application.job?.postedBy.equals(recruiterId)) {
    throw ApiError.notFound("Application not found");
  }
  if (application.status === APPLICATION_STATUS.WITHDRAWN) {
    throw ApiError.badRequest("This application was withdrawn by the candidate");
  }

  if (application.status !== status) {
    application.status = status;
    application.statusHistory.push({ status, note, changedBy: recruiterId });
    await application.save();
  }

  return {
    _id: application._id,
    status: application.status,
    statusHistory: application.statusHistory,
  };
};
