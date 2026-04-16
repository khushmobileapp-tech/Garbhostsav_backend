import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { fetchResolvedDay } from "../utils/dailyActivityPlanner.js";
import {
  buildActivitiesFromContent,
  buildPregnancyDayRecord,
  groupActivitiesBySession,
} from "../utils/pregnancyContent.js";

function calculatePregnancyProgress(profile) {
  const today = new Date();
  const startDate = new Date(profile.pregnancy_start_date);
  const msInDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((today.setHours(0, 0, 0, 0) - startDate.setHours(0, 0, 0, 0)) / msInDay) + 1;
  const day = Math.min(280, Math.max(1, profile.current_day ?? diffDays));
  const week = Math.min(40, Math.max(1, profile.current_week ?? Math.ceil(day / 7)));

  return { day, week };
}

async function getUserProfile(userId) {
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

async function getOrCreateContent(dayNumber) {
  let content = await prisma.pregnancy_day_content.findFirst({
    where: { day_number: dayNumber },
    orderBy: { created_at: "desc" },
  });

  if (!content) {
    content = await prisma.pregnancy_day_content.create({
      data: buildPregnancyDayRecord(dayNumber),
    });
  }

  return content;
}

async function buildDayActivities(userId, dayNumber) {
  const completions = await prisma.user_activity_completion.findMany({
    where: {
      user_id: userId,
      day_number: dayNumber,
    },
  });

  const resolvedDay = await fetchResolvedDay(dayNumber, completions);

  if (resolvedDay.source !== "empty") {
    return resolvedDay.sessions;
  }

  const content = await getOrCreateContent(dayNumber);
  return groupActivitiesBySession(buildActivitiesFromContent(content, dayNumber), completions);
}

export const dailyActivityService = {
  async getToday(userId) {
    const { user, profile } = await getUserProfile(userId);
    const progress = calculatePregnancyProgress(profile);

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
      },
      pregnancy: {
        day: progress.day,
        week: progress.week,
      },
      sessions: await buildDayActivities(userId, progress.day),
    };
  },

  async getByDay(userId, dayNumber) {
    const { profile } = await getUserProfile(userId);
    const week = Math.min(40, Math.max(1, Math.ceil(dayNumber / 7)));

    return {
      day: dayNumber,
      week,
      due_date: profile.due_date,
      sessions: await buildDayActivities(userId, dayNumber),
    };
  },

  async markCompleted(userId, payload) {
    const updated = await prisma.user_activity_completion.upsert({
      where: {
        user_id_day_number_activity_id_session: {
          user_id: userId,
          day_number: payload.day_number,
          activity_id: payload.activity_id,
          session: payload.session,
        },
      },
      create: {
        id: randomUUID(),
        user_id: userId,
        day_number: payload.day_number,
        activity_id: payload.activity_id,
        session: payload.session,
        is_completed: payload.is_completed,
        completed_at: payload.is_completed ? new Date() : null,
      },
      update: {
        is_completed: payload.is_completed,
        completed_at: payload.is_completed ? new Date() : null,
        updated_at: new Date(),
      },
    });

    return {
      message: payload.is_completed ? "Activity marked as completed" : "Activity marked as pending",
      completion: updated,
      sessions: await buildDayActivities(userId, payload.day_number),
    };
  },
};
