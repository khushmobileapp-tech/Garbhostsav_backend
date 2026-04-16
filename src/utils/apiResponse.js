export function sendSuccess(res, { statusCode = 200, message, data = null } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(res, { statusCode = 500, message, errors = null } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
