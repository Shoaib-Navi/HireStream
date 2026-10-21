import { ApiError } from "../utils/ApiError.js";

const toApiError = (zodError) => {
  const errors = zodError.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  return new ApiError(400, errors[0].message, errors);
};

// Validates req.params and req.body against zod schemas.
// The parsed (trimmed, coerced) body replaces req.body, so controllers only see clean data.
export const validate =
  ({ params, body }) =>
  (req, res, next) => {
    if (params) {
      const result = params.safeParse(req.params);
      if (!result.success) throw toApiError(result.error);
    }
    if (body) {
      const result = body.safeParse(req.body ?? {});
      if (!result.success) throw toApiError(result.error);
      req.body = result.data;
    }
    next();
  };
