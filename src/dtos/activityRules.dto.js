import { z } from "zod";

export const activityRulesDto = {
  paramsSchema: z.object({
    id: z.coerce.number().int().positive(),
  }),
  createSchema: z.object({
    activity_id: z.coerce.number().int().positive(),
    timeslot: z.enum(["Morning", "Afternoon", "Evening"]),
    start_day: z.coerce.number().int().min(1).max(280),
    end_day: z.coerce.number().int().min(1).max(280),
    order_index: z.coerce.number().int().min(0).optional().nullable(),
  }),
  updateSchema: z
    .object({
      activity_id: z.coerce.number().int().positive().optional(),
      timeslot: z.enum(["Morning", "Afternoon", "Evening"]).optional(),
      start_day: z.coerce.number().int().min(1).max(280).optional(),
      end_day: z.coerce.number().int().min(1).max(280).optional(),
      order_index: z.coerce.number().int().min(0).optional().nullable(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
};
