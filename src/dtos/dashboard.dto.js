import { z } from "zod";

export const dashboardDto = {
  dayParamsSchema: z
    .object({
      dayNumber: z.coerce.number().int().min(1).max(280),
    })
    .strict(),
};
