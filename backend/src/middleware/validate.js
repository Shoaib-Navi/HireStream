import { ApiError } from "../utils/ApiError.js";

const toApiError = (zodError) => {
  const errors = zodError.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  return ApiError.badRequest(errors[0].message, errors);
};


const replaceRequestValue = (req, key, value) =>
  Object.defineProperty(req, key, { value, writable: true, enumerable: true, configurable: true });

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
