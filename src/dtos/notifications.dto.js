import { z } from "zod";

export const notificationsDto = {
  listSchema: z
    .object({
      status: z.enum(["all", "read", "unread"]).optional().default("all"),
      limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    })
    .strict(),
  paramsSchema: z
    .object({
      id: z.uuid(),
    })
    .strict(),
  registerDeviceTokenSchema: z
    .object({
      device_id: z.string().trim().min(3).max(255),
      push_token: z.string().trim().min(10).max(2000),
      device_type: z.string().trim().min(2).max(50).optional(),
      app_version: z.string().trim().max(20).optional().nullable(),
      notification_enabled: z.boolean().optional().default(true),
    })
    .strict(),
};
