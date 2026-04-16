import { z } from "zod";

export const activitiesDto = {
  paramsSchema: z.object({
    id: z.coerce.number().int().positive(),
  }),
  createSchema: z.object({
    title: z.string().trim().min(1).max(255),
    description: z.string().trim().optional().nullable(),
    activity_type: z.string().trim().min(1).max(50).optional().nullable(),
  }),
  updateSchema: z
    .object({
      title: z.string().trim().min(1).max(255).optional(),
      description: z.string().trim().optional().nullable(),
      activity_type: z.string().trim().min(1).max(50).optional().nullable(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
};
