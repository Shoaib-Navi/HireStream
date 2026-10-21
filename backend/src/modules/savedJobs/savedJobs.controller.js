import { sendSuccess } from "../../utils/response.js";
import * as savedJobsService from "./savedJobs.service.js";

export const list = async (req, res) => {
  const { jobs, meta } = await savedJobsService.listSavedJobs(req.user.id, req.query);
  sendSuccess(res, { data: { jobs }, meta });
};

export const save = async (req, res) => {
  await savedJobsService.saveJob(req.user.id, req.params.jobId);
  sendSuccess(res, { message: "Job saved" });
};

export const remove = async (req, res) => {
  await savedJobsService.unsaveJob(req.user.id, req.params.jobId);
  sendSuccess(res, { message: "Job removed from saved jobs" });
};
