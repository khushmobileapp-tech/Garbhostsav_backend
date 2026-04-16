import { createAuthToken } from "../utils/authToken.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";

const ADMIN_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

export const adminAuthService = {
  async login(payload) {
    const admin = await prisma.admin_users.findFirst({
      where: {
        email: payload.email.toLowerCase(),
        is_active: true,
      },
    });

    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    if (admin.password_hash !== payload.password) {
      throw new AppError("Invalid admin credentials", 401);
    }

    const { token, expiresAt } = createAuthToken(
      {
        sub: admin.id,
        account_type: "admin",
        role: admin.role,
      },
      ADMIN_TOKEN_TTL_SECONDS,
    );

    return {
      access_token: token,
      expires_at: expiresAt,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  },
};
