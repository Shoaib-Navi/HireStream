import { Company } from "../models/company.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// Other recruiters' companies also return 404, so company ids can't be probed
const findOwnedCompany = async (companyId, userId) => {
  const company = await Company.findById(companyId);
  if (!company || !company.userId.equals(userId)) {
    throw new ApiError(404, "Company not found");
  }
  return company;
};

export const registerCompany = async (req, res) => {
  const { companyName } = req.body;

  const companyExists = await Company.exists({ name: companyName });
  if (companyExists) {
    throw new ApiError(409, "You can't register same company");
  }

  const company = await Company.create({
    name: companyName,
    userId: req.id,
  });

  return res.status(201).json({
    message: "Company registered successfully",
    company,
    success: true,
  });
};

// Companies owned by the logged-in recruiter
export const getCompany = async (req, res) => {
  const companies = await Company.find({ userId: req.id }).sort({ createdAt: -1 });
  return res.status(200).json({
    companies,
    success: true,
  });
};

export const getCompanyById = async (req, res) => {
  const company = await findOwnedCompany(req.params.id, req.id);
  return res.status(200).json({
    company,
    success: true,
  });
};

export const updateCompany = async (req, res) => {
  const company = await findOwnedCompany(req.params.id, req.id);
  const { name, description, website, location } = req.body;

  if (name !== company.name) {
    const nameTaken = await Company.exists({ name, _id: { $ne: company._id } });
    if (nameTaken) {
      throw new ApiError(409, "A company with this name already exists");
    }
  }

  company.set({ name, description, website, location });

  // Logo is optional on update; keep the existing one when no new file is sent
  if (req.file) {
    company.logo = await uploadToCloudinary(req.file);
  }

  await company.save();

  return res.status(200).json({
    message: "Company information updated",
    company,
    success: true,
  });
};
