import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import getDataUri from "./datauri.js";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

// Uploads a multer in-memory file and returns its public URL
export const uploadToCloudinary = async (file) => {
  const fileUri = getDataUri(file);
  const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
  return cloudResponse.secure_url;
};

export default cloudinary;
