import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { createAuthToken } from "../utils/authToken.js";
import { buildOtpRecord } from "../utils/otp.js";
import {
  buildTrialPhoneNumber,
  calculatePregnancyStartDate,
  isEmailIdentifier,  
  normalizeIdentifier,
} from "../utils/authHelpers.js";

const LOGIN_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
const TRIAL_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

// 🔹 Build OTP response
function buildOtpResponse(identifier, otp) {
  const data = {
    identifier,
    expires_at: otp.expires_at,
    otp_preview: otp.otp_code,
  };


  return data;
}

// 🔹 Save OTP with meta data
async function saveOtp(identifier, meta = {}) {
  const otp = buildOtpRecord(identifier);

  await prisma.otp_verification.create({
    data: {
      ...otp,
      meta_data: meta, // ✅ store full payload
    },
  });

  return otp;
}

// 🔹 Consume OTP
async function consumeOtpRecord(identifier, otpCode) {
  const otp = await prisma.otp_verification.findFirst({
    where: {
      phone_number: identifier,
      otp_code: otpCode,
      is_verified: false,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  if (!otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (otp.expires_at < new Date()) {
    throw new AppError("OTP has expired", 400);
  }

  await prisma.otp_verification.update({
    where: { id: otp.id },
    data: { is_verified: true },
  });

  return otp; // ✅ return full record (for meta_data)
}

// 🔹 Find user
async function findUserByIdentifier(identifier) {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const isEmail = isEmailIdentifier(normalizedIdentifier);

  return prisma.sys_users.findFirst({
    where: isEmail
      ? { email: normalizedIdentifier }
      : { phone_number: normalizedIdentifier },
  });
}

// 🔹 Build login payload
function buildLoginPayload(user, expiresInSeconds, accountType = "registered") {
  const { token, expiresAt } = createAuthToken(
    {
      sub: user.id,
      account_type: accountType,
    },
    expiresInSeconds,
  );

  return {
    access_token: token,
    expires_at: expiresAt,
    user,
  };
}

export const authService = {
  // =========================
  // 🔐 REGISTER - REQUEST OTP
  // =========================
  async registerRequestOtp(payload) {
    console.log("Register Request OTP Payload:", payload); // Debug log
    const existingUser = await prisma.sys_users.findFirst({
      where: {
        OR: [
          { phone_number: payload.phone_number },
          ...(payload.email ? [{ email: payload.email.toLowerCase() }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new AppError("User already exists with this phone/email", 409);
    }

    const otp = await saveOtp(payload.phone_number, payload); // ✅ store all data

    return buildOtpResponse(payload.phone_number, otp);
  },

  // =========================
  // 🔐 REGISTER - VERIFY OTP
  // =========================
  async registerVerifyOtp(payload) {
    console.log("Register Verify OTP Payload:", payload); // Debug log
    const otpRecord = await consumeOtpRecord(
      payload.phone_number,
      payload.otp_code,
    );

    const data = otpRecord.meta_data;

    if (!data) {
      throw new AppError("Registration data not found", 400);
    }

    const dueDate = new Date(data.expected_delivery_date);
    const pregnancyStartDate = calculatePregnancyStartDate(dueDate);

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.sys_users.create({
        data: {
          id: randomUUID(),
          full_name: data.full_name,
          phone_number: data.phone_number,
          email: data.email?.toLowerCase() ?? null,
          password_hash: "OTP_AUTH",
          device_id: data.device_id,
          is_active: true,
        },
      });

      await tx.user_pregnancy_profiles.create({
        data: {
          id: randomUUID(),
          user_id: user.id,
          pregnancy_start_date: pregnancyStartDate,
          due_date: dueDate,
        },
      });

      const existingDevice = await tx.app_devices.findFirst({
        where: { device_id: data.device_id },
        orderBy: { created_at: "desc" },
      });

      if (existingDevice) {
        await tx.app_devices.update({
          where: { id: existingDevice.id },
          data: {
            user_id: user.id,
            converted_to_user: true,
          },
        });
      }

      return user;
    });

    return buildLoginPayload(createdUser, LOGIN_TOKEN_TTL_SECONDS);
  },

  // =========================
  // 🔐 LOGIN - REQUEST OTP
  // =========================
  async loginRequestOtp(payload) {
    const user = await findUserByIdentifier(payload.identifier);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const identifier = user.phone_number;

    if (!identifier) {
      throw new AppError("User cannot log in with this identifier", 400);
    }

    const otp = await saveOtp(identifier);

    return {
      ...buildOtpResponse(identifier, otp),
      lookup_identifier: normalizeIdentifier(payload.identifier),
    };
  },

  // =========================
  // 🔐 LOGIN - VERIFY OTP
  // =========================
  async loginVerifyOtp(payload) {
    const user = await findUserByIdentifier(payload.identifier);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const identifier = user.phone_number;

    await consumeOtpRecord(identifier, payload.otp_code);

    return buildLoginPayload(user, LOGIN_TOKEN_TTL_SECONDS);
  },

  // =========================
  // 🧪 FREE TRIAL
  // =========================
  async startFreeTrial(payload) {
    const now = new Date();
    const dueDate = new Date(payload.expected_delivery_date);
    const pregnancyStartDate = calculatePregnancyStartDate(dueDate);

    const result = await prisma.$transaction(async (tx) => {
      let device = await tx.app_devices.findFirst({
        where: {
          device_id: payload.device_id,
          converted_to_user: false,
        },
        orderBy: { created_at: "desc" },
      });

      let trialUser = null;

      if (device?.user_id) {
        trialUser = await tx.sys_users.findUnique({
          where: { id: device.user_id },
        });
      }

      if (!trialUser) {
        trialUser = await tx.sys_users.create({
          data: {
            id: randomUUID(),
            full_name: "Trial User",
            phone_number: buildTrialPhoneNumber(payload.device_id),
            email: null,
            password_hash: "TRIAL_AUTH",
            device_id: payload.device_id,
            is_active: true,
          },
        });

        await tx.user_pregnancy_profiles.create({
          data: {
            id: randomUUID(),
            user_id: trialUser.id,
            pregnancy_start_date: pregnancyStartDate,
            due_date: dueDate,
          },
        });
      }

      const trialExpiresAt = new Date(
        now.getTime() + TRIAL_TOKEN_TTL_SECONDS * 1000,
      );

      if (device) {
        device = await tx.app_devices.update({
          where: { id: device.id },
          data: {
            device_type: payload.device_type,
            app_version: payload.app_version ?? null,
            trial_started_at: now,
            trial_expires_at: trialExpiresAt,
            converted_to_user: false,
            user_id: trialUser.id,
          },
        });
      } else {
        device = await tx.app_devices.create({
          data: {
            id: randomUUID(),
            device_id: payload.device_id,
            device_type: payload.device_type,
            app_version: payload.app_version ?? null,
            trial_started_at: now,
            trial_expires_at: trialExpiresAt,
            converted_to_user: false,
            user_id: trialUser.id,
          },
        });
      }

      return { device, trialUser };
    });

    const remainingSeconds = Math.max(
      1,
      Math.floor(
        (new Date(result.device.trial_expires_at).getTime() - Date.now()) /
          1000,
      ),
    );

    const loginPayload = buildLoginPayload(
      result.trialUser,
      remainingSeconds,
      "trial",
    );

    return {
      ...loginPayload,
      trial_started_at: result.device.trial_started_at,
      trial_expires_at: result.device.trial_expires_at,
      app_device_id: result.device.id,
    };
  },
};  