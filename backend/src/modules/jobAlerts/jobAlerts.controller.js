import { sendSuccess } from "../../utils/response.js";
import * as jobAlertsService from "./jobAlerts.service.js";

export const list = async (req, res) => {
  const alerts = await jobAlertsService.listAlerts(req.user.id);
  sendSuccess(res, { data: { alerts } });
};

export const create = async (req, res) => {
  const alert = await jobAlertsService.createAlert(req.user.id, req.body);
  sendSuccess(res, { status: 201, message: "Job alert created", data: { alert } });
};

export const update = async (req, res) => {
  const alert = await jobAlertsService.updateAlert(req.user.id, req.params.id, req.body);
  sendSuccess(res, { message: "Job alert updated", data: { alert } });
};

export const remove = async (req, res) => {
  await jobAlertsService.deleteAlert(req.user.id, req.params.id);
  sendSuccess(res, { message: "Job alert deleted" });
};

export const dispatch = async (req, res) => {
  const result = await jobAlertsService.dispatchDueAlerts();
  sendSuccess(res, { data: result });
};
