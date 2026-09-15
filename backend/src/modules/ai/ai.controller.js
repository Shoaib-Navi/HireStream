import { sendSuccess } from "../../utils/response.js";
import * as aiService from "./ai.service.js";

export const chat = async (req, res) => {
  const reply = await aiService.chatWithAssistant({ userId: req.user?.id, messages: req.body.messages });
  sendSuccess(res, { data: { reply } });
};

export const jobDescription = async (req, res) => {
  const draft = await aiService.draftJobDescription(req.body);
  sendSuccess(res, { data: { draft } });
};
