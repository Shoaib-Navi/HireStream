import { ApiError } from "../utils/ApiError.js";

const toApiError = (zodError) => {
  const errors = zodError.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  return ApiError.badRequest(errors[0].message, errors);
};

// Express 5 exposes req.query through a getter, so the parsed value is set as an own property
const replaceRequestValue = (req, key, value) =>
  Object.defineProperty(req, key, { value, writable: true, enumerable: true, configurable: true });

// Validates req.params, req.query and req.body against zod schemas.
// The parsed (trimmed, coerced, defaulted) values replace the originals, so controllers only see clean data.
export const validate = (schemas) => (req, res, next) => {
  for (const key of ["params", "query", "body"]) {
    const schema = schemas[key];
    if (!schema) continue;
    const result = schema.safeParse(req[key] ?? {});
    if (!result.success) throw toApiError(result.error);
    replaceRequestValue(req, key, result.data);
  }
  next();
};
