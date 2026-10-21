import express from "express";
import { ROLES } from "../../constants/index.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { sendSuccess } from "../../utils/response.js";
import { getRecruiterOverview } from "./dashboard.service.js";

const router = express.Router();

router.get("/recruiter", authenticate, requireRole(ROLES.RECRUITER), async (req, res) => {
  const overview = await getRecruiterOverview(req.user.id);
  sendSuccess(res, { data: overview });
});

export default router;
