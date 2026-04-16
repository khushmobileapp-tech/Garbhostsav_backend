import { prisma } from "../lib/prisma.js";

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function diffDaysCeil(targetDate) {
  const today = startOfToday();
  const diffMs = new Date(targetDate).getTime() - today.getTime();

  if (diffMs <= 0) {
    return 0;
  }

  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

function calculatePregnancyProgress(profile) {
  if (!profile?.pregnancy_start_date) {
    return { current_week: null, current_day: null };
  }

  const startDate = new Date(profile.pregnancy_start_date);
  const today = startOfToday();
  const diffDays = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));

  return {
    current_day: profile.current_day ?? diffDays + 1,
    current_week: profile.current_week ?? Math.floor(diffDays / 7) + 1,
  };
}

export const adminUsersOverviewService = {
  async getUserMaster() {
    const [users, devices, profiles] = await Promise.all([
      prisma.sys_users.findMany({
        orderBy: { created_at: "desc" },
      }),
      prisma.app_devices.findMany({
        orderBy: [{ created_at: "desc" }],
      }),
      prisma.user_pregnancy_profiles.findMany(),
    ]);

    const latestDeviceByUserId = new Map();
    for (const device of devices) {
      if (device.user_id && !latestDeviceByUserId.has(device.user_id)) {
        latestDeviceByUserId.set(device.user_id, device);
      }
    }

    const profileByUserId = new Map(profiles.map((profile) => [profile.user_id, profile]));

    const items = users.map((user) => {
      const latestDevice = latestDeviceByUserId.get(user.id) || null;
      const profile = profileByUserId.get(user.id) || null;
      const pregnancy = calculatePregnancyProgress(profile);
      const isTrialUser = user.password_hash === "TRIAL_AUTH";
      const trialExpiresAt = latestDevice?.trial_expires_at || null;
      const trialDaysLeft =
        isTrialUser && trialExpiresAt ? diffDaysCeil(trialExpiresAt) : null;

      return {
        id: user.id,
        full_name: user.full_name,
        phone_number: user.phone_number,
        email: user.email,
        device_id: latestDevice?.device_id || user.device_id || null,
        device_type: latestDevice?.device_type || null,
        app_version: latestDevice?.app_version || null,
        account_type: isTrialUser ? "trial" : "registered",
        is_active: Boolean(user.is_active),
        trial_status: isTrialUser
          ? trialDaysLeft > 0
            ? "active"
            : "expired"
          : null,
        trial_days_left: trialDaysLeft,
        trial_started_at: latestDevice?.trial_started_at || null,
        trial_expires_at: trialExpiresAt,
        due_date: profile?.due_date || null,
        pregnancy_start_date: profile?.pregnancy_start_date || null,
        current_week: pregnancy.current_week,
        current_day: pregnancy.current_day,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    });

    const summary = {
      total_users: items.length,
      registered_users: items.filter((item) => item.account_type === "registered").length,
      active_registered_users: items.filter(
        (item) => item.account_type === "registered" && item.is_active,
      ).length,
      trial_users: items.filter((item) => item.account_type === "trial").length,
      active_trials: items.filter(
        (item) => item.account_type === "trial" && item.trial_status === "active",
      ).length,
      expired_trials: items.filter(
        (item) => item.account_type === "trial" && item.trial_status === "expired",
      ).length,
    };

    return {
      summary,
      items,
    };
  },
};
