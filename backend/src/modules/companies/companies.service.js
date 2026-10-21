import { JOB_STATUS } from "../../constants/index.js";
import { deleteFile, uploadFile } from "../../services/storage.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateUniqueSlug } from "../../utils/slugify.js";
import { Job } from "../jobs/job.model.js";
import { Company } from "./company.model.js";

// Other recruiters' companies also return 404, so company ids can't be probed
export const findOwnedCompany = async (ownerId, companyId) => {
  const company = await Company.findById(companyId);
  if (!company || !company.owner.equals(ownerId)) {
    throw ApiError.notFound("Company not found");
  }
  return company;
};

export const listOwnedCompanies = async (ownerId) => {
  const companies = await Company.find({ owner: ownerId }).sort({ createdAt: -1 }).lean();

  const openJobCounts = await Job.aggregate([
    { $match: { company: { $in: companies.map((company) => company._id) }, status: JOB_STATUS.OPEN } },
    { $group: { _id: "$company", count: { $sum: 1 } } },
  ]);
  const countByCompany = new Map(openJobCounts.map((item) => [item._id.toString(), item.count]));

  return companies.map((company) => ({
    ...company,
    openJobCount: countByCompany.get(company._id.toString()) ?? 0,
  }));
};

export const createCompany = async (ownerId, data) => {
  const slug = await generateUniqueSlug(Company, data.name);
  return Company.create({ ...data, slug, owner: ownerId });
};

// The slug stays the same when the name changes, so shared links keep working
export const updateCompany = async (ownerId, companyId, updates) => {
  const company = await findOwnedCompany(ownerId, companyId);
  company.set(updates);
  await company.save();
  return company;
};

export const updateCompanyLogo = async (ownerId, companyId, file) => {
  const company = await findOwnedCompany(ownerId, companyId);
  const previousPublicId = company.logo?.publicId;

  company.logo = await uploadFile(file, { folder: "logos" });
  await company.save();

  await deleteFile(previousPublicId);
  return company;
};
