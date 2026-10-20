// API errors are normalized by the base query to { status, message, errors: [{ field, message }] }

// A 400 on a detail page means a malformed id, which to the visitor is the same as a missing record
export const isNotFound = (error) => error?.status === 404 || error?.status === 400;

export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") =>
  error?.message || fallback;

// { "salary.max": "Maximum salary must be at least the minimum", ... }
export const getFieldErrors = (error) =>
  Object.fromEntries((error?.errors ?? []).filter((item) => item.field).map((item) => [item.field, item.message]));
