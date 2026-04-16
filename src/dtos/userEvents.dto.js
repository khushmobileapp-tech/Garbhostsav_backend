import { z } from "zod";

export const userEventsDto = {
  registerSchema: z
    .object({
      event_id: z.uuid(),
    })
    .strict(),
};
