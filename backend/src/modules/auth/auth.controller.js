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

export const verifyEmail = async (req, res) => {
  const user = await authService.verifyEmail(req.body.token);
  sendSuccess(res, { message: "Your email is verified", data: { user } });
};

export const resendVerification = async (req, res) => {
  await authService.resendVerificationEmail(req.user.id);
  sendSuccess(res, { message: "We've sent a new verification link to your email" });
};

export const forgotPassword = async (req, res) => {
  await authService.requestPasswordReset(req.body.email);
  sendSuccess(res, { message: "If an account exists for this email, we've sent a link to reset the password" });
};

export const resetPassword = async (req, res) => {
  await authService.resetPassword(req.body);
  clearAuthCookie(res);
  sendSuccess(res, { message: "Your password has been reset. Please log in with your new password." });
};

export const changePassword = async (req, res) => {
  const user = await authService.changePassword(req.user.id, req.body);
  setAuthCookie(res, authService.createSessionToken(user));
  sendSuccess(res, { message: "Password changed. Other devices have been signed out." });
};
