import { DUPLICATE_KEY_ERROR, JOB_STATUS } from "../../constants/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { paginationMeta, toPagination } from "../../utils/pagination.js";
import { CARD_COMPANY_FIELDS, toJobCard } from "../jobs/job.presenter.js";
import { Job } from "../jobs/job.model.js";
import { SavedJob } from "./savedJob.model.js";

export const listSavedJobs = async (userId, query) => {
  const { page, limit, skip } = toPagination(query);

  const [savedJobs, total] = await Promise.all([
    SavedJob.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "job",
        select: "-requirements -responsibilities",
        populate: { path: "company", select: CARD_COMPANY_FIELDS },
      })
      .lean(),
    SavedJob.countDocuments({ user: userId }),
  ]);

  const jobs = savedJobs
    .filter((savedJob) => savedJob.job)
    .map((savedJob) => ({ ...toJobCard(savedJob.job), isSaved: true, savedAt: savedJob.createdAt }));

  return { jobs, meta: paginationMeta({ page, limit }, total) };
};

// Saving is idempotent: saving an already saved job succeeds
export const saveJob = async (userId, jobId) => {
  const jobExists = await Job.exists({ _id: jobId, status: { $ne: JOB_STATUS.DRAFT } });
  if (!jobExists) {
    throw ApiError.notFound("Job not found");
  }

  try {
    await SavedJob.updateOne({ user: userId, job: jobId }, { $setOnInsert: { user: userId, job: jobId } }, { upsert: true });
  } catch (error) {
    // a simultaneous request already saved it
    if (error.code !== DUPLICATE_KEY_ERROR) throw error;
  }
};

export const unsaveJob = async (userId, jobId) => {
  await SavedJob.deleteOne({ user: userId, job: jobId });
};
