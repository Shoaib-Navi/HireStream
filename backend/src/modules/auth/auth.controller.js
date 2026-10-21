import { clearAuthCookie, setAuthCookie } from "../../utils/cookies.js";
import { sendSuccess } from "../../utils/response.js";
import * as authService from "./auth.service.js";

export const register = async (req, res) => {
  const user = await authService.registerUser(req.body);
  setAuthCookie(res, authService.createSessionToken(user));
  sendSuccess(res, { status: 201, message: "Account created successfully", data: { user } });
};

export const login = async (req, res) => {
  const user = await authService.loginUser(req.body);
  setAuthCookie(res, authService.createSessionToken(user));
  sendSuccess(res, { message: `Welcome back, ${user.fullName}`, data: { user } });
};

export const logout = async (req, res) => {
  clearAuthCookie(res);
  sendSuccess(res, { message: "Logged out successfully" });
};

export const me = async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  sendSuccess(res, { data: { user } });
};
