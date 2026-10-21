// API errors are normalized by the base query to { status, message, errors: [{ field, message }] }

export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") =>
  error?.message || fallback;

// { "salary.max": "Maximum salary must be at least the minimum", ... }
export const getFieldErrors = (error) =>
  Object.fromEntries((error?.errors ?? []).filter((item) => item.field).map((item) => [item.field, item.message]));
