import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { verifyAuthToken } from "../utils/authToken.js";

export async function authenticate(req, _res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Authorization token is required", 401));
  }

  const token = header.slice("Bearer ".length).trim();
  const payload = verifyAuthToken(token);

  if (!payload?.sub) {
    return next(new AppError("Invalid or expired token", 401));
  }

  const user = await prisma.sys_users.findUnique({
    where: { id: payload.sub },
  });

  if (!user) {
    return next(new AppError("User not found for token", 401));
  }

  req.auth = payload;
  req.user = user;
  return next();
}
