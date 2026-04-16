import { z } from "zod";

export const adminNotificationsDto = {
  runSchema: z
    .object({
      date_time: z.coerce.date().optional(),
    })
    .strict(),
};
