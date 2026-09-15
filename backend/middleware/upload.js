import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const RESUME_TYPES = ["application/pdf"];

const createSingleUpload = (allowedTypes, errorMessage) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: (req, file, cb) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new ApiError(400, errorMessage));
      }
    },
  }).single("file"); // same name as the frontend's FormData field

export const uploadImage = createSingleUpload(IMAGE_TYPES, "Image must be a JPG, PNG, WEBP or GIF file");
export const uploadResume = createSingleUpload(RESUME_TYPES, "Resume must be a PDF file");
