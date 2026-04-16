import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { verifyAuthToken } from "../utils/authToken.js";

export async function authenticateAdmin(req, _res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Admin authorization token is required", 401));
  }

  const token = header.slice("Bearer ".length).trim();
  const payload = verifyAuthToken(token);

  if (!payload?.sub || payload.account_type !== "admin") {
    return next(new AppError("Invalid or expired admin token", 401));
  }

  const admin = await prisma.admin_users.findUnique({
    where: { id: payload.sub },
  });

  if (!admin || admin.is_active === false) {
    return next(new AppError("Admin not found for token", 401));
  }

  req.admin = admin;
  req.auth = payload;
  return next();
}
