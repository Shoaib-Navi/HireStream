import multer from "multer";
import { MAX_UPLOAD_BYTES } from "../constants/index.js";
import { ApiError } from "../utils/ApiError.js";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const RESUME_TYPES = ["application/pdf"];

// Single required file in the "file" field, kept in memory and passed to the storage service
const createSingleUpload = (allowedTypes, typeErrorMessage) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
    fileFilter: (req, file, cb) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(ApiError.badRequest(typeErrorMessage));
      }
    },
  }).single("file");

  return (req, res, next) => {
    upload(req, res, (error) => {
      if (error) return next(error);
      if (!req.file) return next(ApiError.badRequest("Please choose a file to upload"));
      next();
    });
  };
};

export const uploadImage = createSingleUpload(IMAGE_TYPES, "Image must be a JPG, PNG, WEBP or GIF file");
export const uploadResume = createSingleUpload(RESUME_TYPES, "Resume must be a PDF file");
