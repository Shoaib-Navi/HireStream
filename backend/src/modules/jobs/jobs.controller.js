import { sendSuccess } from "../../utils/response.js";
import * as jobsService from "./jobs.service.js";

export const listPublic = async (req, res) => {
  const { jobs, meta } = await jobsService.listPublicJobs(req.query);
  sendSuccess(res, { data: { jobs }, meta });
};

export const getOne = async (req, res) => {
  const job = await jobsService.getJobDetails(req.params.id, req.user);
  sendSuccess(res, { data: { job } });
};

export const create = async (req, res) => {
  const job = await jobsService.createJob(req.user.id, req.body);
  sendSuccess(res, { status: 201, message: "Job posted successfully", data: { job } });
};

export const listMine = async (req, res) => {
  const { jobs, meta } = await jobsService.listRecruiterJobs(req.user.id, req.query);
  sendSuccess(res, { data: { jobs }, meta });
};
