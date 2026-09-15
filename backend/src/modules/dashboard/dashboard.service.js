import { JOB_STATUS } from "../../constants/index.js";
import { Application } from "../applications/application.model.js";
import { Company } from "../companies/company.model.js";
import { Job } from "../jobs/job.model.js";

const RECENT_APPLICATIONS = 5;
const TOP_JOBS = 5;

// Hiring overview for a recruiter: job counts, pipeline, latest applicants and busiest open jobs
export const getRecruiterOverview = async (recruiterId) => {
  const [jobs, companyCount] = await Promise.all([
    Job.find({ postedBy: recruiterId })
      .select("title status applicationCount createdAt company")
      .populate({ path: "company", select: "name slug logo" })
      .lean(),
    Company.countDocuments({ owner: recruiterId }),
  ]);
  const jobIds = jobs.map((job) => job._id);

  const [statusCounts, recentApplications] = await Promise.all([
    Application.aggregate([{ $match: { job: { $in: jobIds } } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Application.find({ job: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .limit(RECENT_APPLICATIONS)
      .select("status createdAt job candidate")
      .populate({ path: "candidate", select: "fullName avatar" })
      .populate({ path: "job", select: "title" })
      .lean(),
  ]);

  const jobCounts = Object.fromEntries(Object.values(JOB_STATUS).map((status) => [status, 0]));
  for (const job of jobs) jobCounts[job.status] += 1;

  const byStatus = Object.fromEntries(statusCounts.map((item) => [item._id, item.count]));

  return {
    companyCount,
    jobs: jobCounts,
    applications: {
      total: statusCounts.reduce((sum, item) => sum + item.count, 0),
      byStatus,
    },
    recentApplications,
    topJobs: jobs
      .filter((job) => job.status === JOB_STATUS.OPEN)
      .sort((a, b) => b.applicationCount - a.applicationCount)
      .slice(0, TOP_JOBS),
  };
};
