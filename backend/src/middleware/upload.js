import multer from "multer";
import { MAX_UPLOAD_BYTES } from "../constants/index.js";
import { ApiError } from "../utils/ApiError.js";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const RESUME_TYPES = ["application/pdf"];

// The browser only declares a file's type, so resumes must also start like a PDF
// (images are checked by the storage service when it processes them)
const isPdf = (file) => file.buffer.subarray(0, 5).toString("latin1") === "%PDF-";

// Single required file in the "file" field, kept in memory and passed to the storage service
const createSingleUpload = (allowedTypes, typeErrorMessage, hasValidContent = () => true) => {
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
      if (!hasValidContent(req.file)) return next(ApiError.badRequest(typeErrorMessage));
      next();
    });
  };
};

export const uploadImage = createSingleUpload(IMAGE_TYPES, "Image must be a JPG, PNG, WEBP or GIF file");
export const uploadResume = createSingleUpload(RESUME_TYPES, "Resume must be a PDF file", isPdf);
