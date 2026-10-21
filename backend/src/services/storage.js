import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";

const isConfigured = Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

// "Aarav Sharma CV.pdf" -> "aarav-sharma-cv-m1x2y3", readable in the Cloudinary console
const toPublicId = (filename = "resume") => `${slugify(filename.replace(/\.[^.]+$/, ""))}-${Date.now().toString(36)}`;

// Uploads a multer in-memory file and returns { url, publicId }.
// Resumes use the "raw" resource type so PDFs are always deliverable.
export const uploadFile = (file, { folder, resourceType = "image" }) => {
  if (!isConfigured) {
    return Promise.reject(new ApiError(503, "File uploads are not available right now."));
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.cloudinary.folder}/${folder}`,
        resource_type: resourceType,
        // upload_stream has no filename, so use_filename has nothing to work from and every
        // resume would land as "file_<random>". Build a readable id from the uploaded name.
        ...(resourceType === "raw" && { public_id: toPublicId(file.originalname) }),
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Upload failed: ${error.message}`));
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      },
    );
    stream.end(file.buffer);
  });
};

// Best effort: a failed cleanup must not fail the user's request
export const deleteFile = async (publicId, resourceType = "image") => {
  if (!isConfigured || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error("Failed to delete file from storage:", error.message);
  }
};
