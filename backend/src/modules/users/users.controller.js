import { sendSuccess } from "../../utils/response.js";
import * as usersService from "./users.service.js";

export const updateAccount = async (req, res) => {
  const user = await usersService.updateAccount(req.user.id, req.body);
  sendSuccess(res, { message: "Account updated", data: { user } });
};

export const updateAvatar = async (req, res) => {
  const user = await usersService.updateAvatar(req.user.id, req.file);
  sendSuccess(res, { message: "Profile photo updated", data: { user } });
};

export const getProfile = async (req, res) => {
  const profile = await usersService.getCandidateProfile(req.user.id);
  sendSuccess(res, { data: { profile } });
};

export const updateProfile = async (req, res) => {
  const profile = await usersService.updateCandidateProfile(req.user.id, req.body);
  sendSuccess(res, { message: "Profile updated", data: { profile } });
};

export const updateResume = async (req, res) => {
  const profile = await usersService.updateResume(req.user.id, req.file);
  sendSuccess(res, { message: "Resume uploaded", data: { profile } });
};

export const removeResume = async (req, res) => {
  const profile = await usersService.removeResume(req.user.id);
  sendSuccess(res, { message: "Resume removed", data: { profile } });
};
