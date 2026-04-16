import { calculatePregnancyStartDate } from "../utils/authHelpers.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";

async function getUserWithProfile(userId) {
  const user = await prisma.sys_users.findUnique({
    where: { id: userId },
    include: {
      user_pregnancy_profiles: {
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const profile = user.user_pregnancy_profiles[0];

  if (!profile) {
    throw new AppError("Pregnancy profile not found for user", 404);
  }

  return { user, profile };
}

function buildProfileResponse(user, profile) {
  return {
    id: user.id,
    full_name: user.full_name,
    phone_number: user.phone_number,
    email: user.email,
    device_id: user.device_id,
    is_active: user.is_active,
    pregnancy_profile: {
      id: profile.id,
      due_date: profile.due_date,
      pregnancy_start_date: profile.pregnancy_start_date,
      current_week: profile.current_week,
      current_day: profile.current_day,
      baby_name: profile.baby_name,
      doctor_name: profile.doctor_name,
      hospital_name: profile.hospital_name,
    },
  };
}

export const profileService = {
  async getProfile(userId) {
    const { user, profile } = await getUserWithProfile(userId);
    return buildProfileResponse(user, profile);
  },

  async updateProfile(userId, payload) {
    const { user, profile } = await getUserWithProfile(userId);

    const userData = {};
    if ("full_name" in payload) userData.full_name = payload.full_name;
    if ("phone_number" in payload) userData.phone_number = payload.phone_number;
    if ("email" in payload) userData.email = payload.email?.toLowerCase() ?? null;
    if ("device_id" in payload) userData.device_id = payload.device_id;

    const profileData = {};
    if ("expected_delivery_date" in payload) {
      profileData.due_date = payload.expected_delivery_date;
      profileData.pregnancy_start_date = calculatePregnancyStartDate(payload.expected_delivery_date);
      profileData.updated_at = new Date();
    }
    if ("baby_name" in payload) profileData.baby_name = payload.baby_name ?? null;
    if ("doctor_name" in payload) profileData.doctor_name = payload.doctor_name ?? null;
    if ("hospital_name" in payload) profileData.hospital_name = payload.hospital_name ?? null;
    if (!("updated_at" in profileData) && Object.keys(profileData).length > 0) {
      profileData.updated_at = new Date();
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser =
        Object.keys(userData).length > 0
          ? await tx.sys_users.update({
              where: { id: user.id },
              data: userData,
            })
          : user;

      const updatedProfile =
        Object.keys(profileData).length > 0
          ? await tx.user_pregnancy_profiles.update({
              where: { id: profile.id },
              data: profileData,
            })
          : profile;

      return { updatedUser, updatedProfile };
    });

    return buildProfileResponse(result.updatedUser, result.updatedProfile);
  },
};
