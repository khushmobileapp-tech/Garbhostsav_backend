import { prisma } from "../lib/prisma.js";
import { notificationsService } from "./notifications.service.js";

const DAILY_NOTIFICATION_SCHEDULE = {
  morning: 8,
  afternoon: 14,
  evening: 20,
};

function startOfMinute(value = new Date()) {
  const date = new Date(value);
  date.setSeconds(0, 0);
  return date;
}

function endOfMinute(value = new Date()) {
  const date = startOfMinute(value);
  date.setMinutes(date.getMinutes() + 1);
  return date;
}

function calculatePregnancyProgress(profile) {
  const today = new Date();
  const startDate = new Date(profile.pregnancy_start_date);
  const msInDay = 24 * 60 * 60 * 1000;
  const diffDays =
    Math.floor((today.setHours(0, 0, 0, 0) - startDate.setHours(0, 0, 0, 0)) / msInDay) + 1;
  const day = Math.min(280, Math.max(1, profile.current_day ?? diffDays));
  const week = Math.min(40, Math.max(1, profile.current_week ?? Math.ceil(day / 7)));

  return { day, week };
}

async function getUsersWithProfiles() {
  return prisma.sys_users.findMany({
    where: { is_active: true },
    include: {
      user_pregnancy_profiles: {
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
  });
}

async function runDailyActivityNotifications(now = new Date()) {
  const hour = now.getHours();
  const session = Object.entries(DAILY_NOTIFICATION_SCHEDULE).find(([, targetHour]) => targetHour === hour)?.[0];

  if (!session) {
    return {
      job: "daily_activity",
      processed: 0,
      created: 0,
      skipped: true,
      reason: "No reminder configured for the current hour",
    };
  }

  const users = await getUsersWithProfiles();
  let created = 0;
  let processed = 0;

  for (const user of users) {
    const profile = user.user_pregnancy_profiles[0];
    if (!profile) {
      continue;
    }

    processed += 1;
    const progress = calculatePregnancyProgress(profile);
    const notification = await notificationsService.createDailyActivityNotification({
      userId: user.id,
      fullName: user.full_name,
      dayNumber: progress.day,
      week: progress.week,
      session,
      now,
    });

    if (notification) {
      created += 1;
    }
  }

  return {
    job: "daily_activity",
    session,
    processed,
    created,
    skipped: false,
  };
}

async function runUpcomingEventNotifications(now = new Date()) {
  const nowMinute = startOfMinute(now);
  const next24Hours = new Date(nowMinute.getTime() + 24 * 60 * 60 * 1000);

  const registrations = await prisma.event_registration.findMany({
    where: {
      events: {
        is_active: true,
        event_date: {
          gte: nowMinute,
          lte: next24Hours,
        },
      },
    },
    include: {
      events: true,
      sys_users: true,
    },
  });

  let created = 0;
  for (const registration of registrations) {
    const notification = await notificationsService.createRegisteredEventReminder(
      registration.user_id,
      registration.events,
    );

    if (notification) {
      created += 1;
    }
  }

  return {
    job: "event_upcoming",
    processed: registrations.length,
    created,
    window_start: nowMinute,
    window_end: next24Hours,
  };
}

export const notificationEngineService = {
  async runDailyActivityNotifications(now = new Date()) {
    return runDailyActivityNotifications(now);
  },

  async runEventNotifications(now = new Date()) {
    return runUpcomingEventNotifications(now);
  },

  async runAll(now = new Date()) {
    const [daily, events] = await Promise.all([
      runDailyActivityNotifications(now),
      runUpcomingEventNotifications(now),
    ]);

    return {
      ran_at: now,
      jobs: [daily, events],
    };
  },

  currentMinuteWindow(now = new Date()) {
    return {
      start: startOfMinute(now),
      end: endOfMinute(now),
    };
  },
};
