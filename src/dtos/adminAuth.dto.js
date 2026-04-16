import { z } from "zod";

export const adminAuthDto = {
  loginSchema: z
    .object({
      email: z.email().max(150),
      password: z.string().trim().min(1).max(255),
    })
    .strict(),
};
