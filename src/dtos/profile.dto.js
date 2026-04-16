import { z } from "zod";

export const profileDto = {
  updateSchema: z
    .object({
      full_name: z.string().trim().min(2).max(100).optional(),
      phone_number: z.string().trim().min(10).max(15).optional(),
      email: z.email().max(150).optional().nullable(),
      device_id: z.string().trim().min(3).max(255).optional(),
      expected_delivery_date: z.coerce.date().optional(),
      baby_name: z.string().trim().max(100).optional().nullable(),
      doctor_name: z.string().trim().max(150).optional().nullable(),
      hospital_name: z.string().trim().max(150).optional().nullable(),
    })
    .strict(),
};
