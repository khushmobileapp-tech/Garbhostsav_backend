import { AppError } from "../utils/appError.js";

export function notFound(req, _res, next) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
}
