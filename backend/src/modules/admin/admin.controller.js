import { sendSuccess } from "../../utils/response.js";
import * as adminService from "./admin.service.js";

export const overview = async (req, res) => {
  const data = await adminService.getPlatformOverview();
  sendSuccess(res, { data });
};

export const listUsers = async (req, res) => {
  const { users, meta } = await adminService.listUsers(req.query);
  sendSuccess(res, { data: { users }, meta });
};

export const updateUserStatus = async (req, res) => {
  const user = await adminService.updateUserStatus(req.user.id, req.params.id, req.body.status);
  sendSuccess(res, { message: "User status updated", data: { user } });
};

export const listCompanies = async (req, res) => {
  const { companies, meta } = await adminService.listCompanies(req.query);
  sendSuccess(res, { data: { companies }, meta });
};

export const updateCompany = async (req, res) => {
  const company = await adminService.updateCompany(req.params.id, req.body);
  sendSuccess(res, { message: "Company updated", data: { company } });
};

export const listJobs = async (req, res) => {
  const { jobs, meta } = await adminService.listJobs(req.query);
  sendSuccess(res, { data: { jobs }, meta });
};

export const updateJobStatus = async (req, res) => {
  const job = await adminService.updateJobStatus(req.params.id, req.body.status);
  sendSuccess(res, { message: "Job status updated", data: { job } });
};

export const removeJob = async (req, res) => {
  await adminService.deleteJob(req.params.id);
  sendSuccess(res, { message: "Job deleted" });
};
