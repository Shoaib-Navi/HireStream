import { COMPANY_STATUS, JOB_STATUS } from "../../constants/index.js";
import { deleteFile, uploadFile } from "../../services/storage.js";
import { ApiError } from "../../utils/ApiError.js";
import { escapeRegex } from "../../utils/escapeRegex.js";
import { paginationMeta, toPagination } from "../../utils/pagination.js";
import { generateUniqueSlug } from "../../utils/slugify.js";
import { Job } from "../jobs/job.model.js";
import { Company } from "./company.model.js";

const PUBLIC_COMPANY_FIELDS = "name slug description website location industry size foundedYear logo isVerified createdAt";

// Adds openJobCount to each company with a single aggregation
const withOpenJobCounts = async (companies) => {
  if (companies.length === 0) return companies;

  const counts = await Job.aggregate([
    { $match: { company: { $in: companies.map((company) => company._id) }, status: JOB_STATUS.OPEN } },
    { $group: { _id: "$company", count: { $sum: 1 } } },
  ]);
  const countByCompany = new Map(counts.map((item) => [item._id.toString(), item.count]));

  return companies.map((company) => ({
    ...company,
    openJobCount: countByCompany.get(company._id.toString()) ?? 0,
  }));
};

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
  return withOpenJobCounts(companies);
};

// Public directory: active companies, verified ones first
export const listPublicCompanies = async (query) => {
  const { page, limit, skip } = toPagination(query);
  const filter = {
    status: COMPANY_STATUS.ACTIVE,
    ...(query.q && { name: new RegExp(escapeRegex(query.q), "i") }),
  };

  const [companies, total] = await Promise.all([
    Company.find(filter).select(PUBLIC_COMPANY_FIELDS).sort({ isVerified: -1, name: 1 }).skip(skip).limit(limit).lean(),
    Company.countDocuments(filter),
  ]);

  return { companies: await withOpenJobCounts(companies), meta: paginationMeta({ page, limit }, total) };
};

export const getPublicCompany = async (slug) => {
  const company = await Company.findOne({ slug, status: COMPANY_STATUS.ACTIVE }).select(PUBLIC_COMPANY_FIELDS).lean();
  if (!company) {
    throw ApiError.notFound("Company not found");
  }
  const [withCount] = await withOpenJobCounts([company]);
  return withCount;
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
