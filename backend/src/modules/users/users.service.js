import { deleteFile, uploadFile } from "../../services/storage.js";
import { ApiError } from "../../utils/ApiError.js";
import { CandidateProfile } from "./candidateProfile.model.js";
import { User } from "./user.model.js";

// Sub-objects updated key by key, so sending { links: { github } } keeps the other links
const NESTED_PROFILE_FIELDS = ["links", "preferences"];

const findUserOrThrow = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return user;
};

export const updateAccount = async (userId, updates) => {
  await findUserOrThrow(userId);
  return User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
};

export const updateAvatar = async (userId, file) => {
  const user = await findUserOrThrow(userId);
  const previousPublicId = user.avatar?.publicId;

  const avatar = await uploadFile(file, { folder: "avatars" });
  const updated = await User.findByIdAndUpdate(userId, { avatar }, { new: true });

  await deleteFile(previousPublicId);
  return updated;
};

// Profiles are created at sign up; older accounts get one on first access
export const getCandidateProfile = (userId) =>
  CandidateProfile.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

export const updateCandidateProfile = async (userId, updates) => {
  const $set = {};
  for (const [key, value] of Object.entries(updates)) {
    if (NESTED_PROFILE_FIELDS.includes(key)) {
      for (const [subKey, subValue] of Object.entries(value)) {
        $set[`${key}.${subKey}`] = subValue;
      }
    } else {
      $set[key] = value;
    }
  }

  return CandidateProfile.findOneAndUpdate(
    { user: userId },
    { $set, $setOnInsert: { user: userId } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
};

export const updateResume = async (userId, file) => {
  const profile = await getCandidateProfile(userId);
  const previousPublicId = profile.resume?.publicId;

  const uploaded = await uploadFile(file, { folder: "resumes", resourceType: "raw" });
  profile.resume = { ...uploaded, originalName: file.originalname, uploadedAt: new Date() };
  await profile.save();

  await deleteFile(previousPublicId, "raw");
  return profile;
};

export const removeResume = async (userId) => {
  const profile = await getCandidateProfile(userId);
  const previousPublicId = profile.resume?.publicId;

  profile.resume = undefined;
  await profile.save();

  await deleteFile(previousPublicId, "raw");
  return profile;
};
