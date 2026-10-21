import { sendSuccess } from "../../utils/response.js";
import * as aiService from "./ai.service.js";

export const chat = async (req, res) => {
  const reply = await aiService.chatWithAssistant({ userId: req.user?.id, messages: req.body.messages });
  sendSuccess(res, { data: { reply } });
};
