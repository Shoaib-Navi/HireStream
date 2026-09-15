import express from "express";
import { getCompany, getCompanyById, registerCompany, updateCompany } from "../controller/company.js";
import { isAuthenticated, requireRole } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../validators/common.js";
import { registerCompanySchema, updateCompanySchema } from "../validators/company.js";

const router = express.Router();

// Every company endpoint is for recruiters only
router.use(isAuthenticated, requireRole("recruiter"));

router.post("/register", validate({ body: registerCompanySchema }), registerCompany);
router.get("/get", getCompany);
router.get("/get/:id", validate({ params: idParams }), getCompanyById);
router.put(
  "/update/:id",
  validate({ params: idParams }),
  uploadImage,
  validate({ body: updateCompanySchema }),
  updateCompany,
);

export default router;
