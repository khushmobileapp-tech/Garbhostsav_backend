import { z } from "zod";

export const dailyActivityDto = {
  dayParamsSchema: z
    .object({
      dayNumber: z.coerce.number().int().min(1).max(280),
    })
    .strict(),
  completeSchema: z
    .object({
      day_number: z.coerce.number().int().min(1).max(280),
      activity_id: z.enum(["meditation", "music", "reading", "affirmation", "tip"]),
      session: z.enum(["morning", "afternoon", "evening"]),
      is_completed: z.boolean().default(true),
    })
    .strict(),
};
