import { sendSuccess } from "../../utils/response.js";
import * as applicationsService from "./applications.service.js";

export const apply = async (req, res) => {
  const application = await applicationsService.applyToJob(req.user.id, req.params.jobId, req.body);
  sendSuccess(res, { status: 201, message: "Application submitted successfully", data: { application } });
};

export const listForJob = async (req, res) => {
  const { meta, ...data } = await applicationsService.listJobApplications(req.user.id, req.params.jobId, req.query);
  sendSuccess(res, { data, meta });
};

export const listMine = async (req, res) => {
  const { applications, meta } = await applicationsService.listCandidateApplications(req.user.id, req.query);
  sendSuccess(res, { data: { applications }, meta });
};

export const getOne = async (req, res) => {
  const application = await applicationsService.getApplication(req.params.id, req.user);
  sendSuccess(res, { data: { application } });
};

export const withdraw = async (req, res) => {
  const application = await applicationsService.withdrawApplication(req.user.id, req.params.id);
  sendSuccess(res, { message: "Application withdrawn", data: { application } });
};

export const updateStatus = async (req, res) => {
  const application = await applicationsService.updateApplicationStatus(req.user.id, req.params.id, req.body);
  sendSuccess(res, { message: "Application status updated", data: { application } });
};
