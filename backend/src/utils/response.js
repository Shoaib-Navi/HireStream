// Every successful response has the shape { success: true, message?, data?, meta? }
export const sendSuccess = (res, { status = 200, message, data, meta } = {}) =>
  res.status(status).json({
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  });
