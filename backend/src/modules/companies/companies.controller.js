import { sendSuccess } from "../../utils/response.js";
import * as companiesService from "./companies.service.js";

export const listMine = async (req, res) => {
  const companies = await companiesService.listOwnedCompanies(req.user.id);
  sendSuccess(res, { data: { companies } });
};

export const getMine = async (req, res) => {
  const company = await companiesService.findOwnedCompany(req.user.id, req.params.id);
  sendSuccess(res, { data: { company } });
};

export const create = async (req, res) => {
  const company = await companiesService.createCompany(req.user.id, req.body);
  sendSuccess(res, { status: 201, message: "Company registered successfully", data: { company } });
};

export const update = async (req, res) => {
  const company = await companiesService.updateCompany(req.user.id, req.params.id, req.body);
  sendSuccess(res, { message: "Company information updated", data: { company } });
};

export const updateLogo = async (req, res) => {
  const company = await companiesService.updateCompanyLogo(req.user.id, req.params.id, req.file);
  sendSuccess(res, { message: "Company logo updated", data: { company } });
};
