import { z } from "zod";

export const activityContentDto = {
  paramsSchema: z.object({
    id: z.coerce.number().int().positive(),
  }),
  createSchema: z.object({
    activity_id: z.coerce.number().int().positive(),
    type: z.enum(["video", "audio", "text"]),
    url: z.string().trim().min(1),
    day_number: z.coerce.number().int().min(1).max(280).optional().nullable(),
    is_primary: z.boolean().optional().nullable(),
  }),
  updateSchema: z
    .object({
      activity_id: z.coerce.number().int().positive().optional(),
      type: z.enum(["video", "audio", "text"]).optional(),
      url: z.string().trim().min(1).optional(),
      day_number: z.coerce.number().int().min(1).max(280).optional().nullable(),
      is_primary: z.boolean().optional().nullable(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
};
