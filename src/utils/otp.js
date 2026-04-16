import { randomInt, randomUUID } from "node:crypto";

export function generateOtpCode() {
  return String(randomInt(100000, 1000000));
}

export function buildOtpRecord(identifier) {
  return {
    id: randomUUID(),
    phone_number: identifier,
    otp_code: generateOtpCode(),
    is_verified: false,
    expires_at: new Date(Date.now() + 10 * 60 * 1000),
  };
}
