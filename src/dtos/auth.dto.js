import { z } from "zod";

const phoneSchema = z.string().trim().min(10).max(15);
const emailSchema = z.email().max(150);
const dueDateSchema = z.coerce.date();
const identifierSchema = z.string().trim().min(3).max(150);
const deviceIdSchema = z.string().trim().min(3).max(255);

export const authDto = {
  registerRequestOtpSchema: z
    .object({
      full_name: z.string().trim().min(2).max(100),
      phone_number: phoneSchema,
      email: emailSchema.optional(),
      expected_delivery_date: dueDateSchema,
      device_id: deviceIdSchema,
    })
    .strict(),
registerVerifyOtpSchema: z
  .object({
    phone_number: phoneSchema,
    otp_code: z.string().trim().length(6),
  })
  .strict(),
  loginRequestOtpSchema: z
    .object({
      identifier: identifierSchema,
    })
    .strict(),
  loginVerifyOtpSchema: z
    .object({
      identifier: identifierSchema,
      otp_code: z.string().trim().length(6),
    })
    .strict(),
  trialLoginSchema: z
    .object({
      expected_delivery_date: dueDateSchema,
      device_id: deviceIdSchema,
      device_type: z.string().trim().min(2).max(50),
      app_version: z.string().trim().max(20).optional(),
    })
    .strict(),
};
