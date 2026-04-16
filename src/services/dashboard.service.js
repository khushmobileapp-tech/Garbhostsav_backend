import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import {
  fetchResolvedDay,
  flattenSessions,
} from "../utils/dailyActivityPlanner.js";
import { buildActivitiesFromContent, buildPregnancyDayRecord } from "../utils/pregnancyContent.js";

function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good Morning 🌸";
  }

  if (hour < 17) {
    return "Good Afternoon 🌼";
  }

  return "Good Evening 🌙";
}

function getFirstName(fullName) {
  return fullName.trim().split(/\s+/)[0] || fullName;
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

export const dashboardService = {
  async getDashboard(userId) {
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

    const pregnancy = calculatePregnancyProgress(profile);
    const resolvedDay = await fetchResolvedDay(pregnancy.day);
    const activities =
      resolvedDay.source !== "empty"
        ? flattenSessions(resolvedDay.sessions)
        : buildActivitiesFromContent(await getOrCreateContent(pregnancy.day), pregnancy.day);

    return {
      greeting: getGreeting(),
      name: getFirstName(user.full_name),
      pregnancy: {
        day: pregnancy.day,
        week: pregnancy.week,
        message: `Day ${pregnancy.day} of Your Pregnancy Journey 💛`,
      },
      user_information: {
        full_name: user.full_name,
        phone_number: user.phone_number,
        email: user.email,
        due_date: profile.due_date,
        pregnancy_start_date: profile.pregnancy_start_date,
      },
      activities,
    };
  },

  async getDailyContent(dayNumber) {
    const resolvedDay = await fetchResolvedDay(dayNumber);

    if (resolvedDay.source !== "empty") {
      return {
        day: dayNumber,
        week: Math.ceil(dayNumber / 7),
        activities: flattenSessions(resolvedDay.sessions),
      };
    }

    const content = await getOrCreateContent(dayNumber);

    return {
      day: dayNumber,
      week: Math.ceil(dayNumber / 7),
      activities: buildActivitiesFromContent(content, dayNumber),
    };
  },

  async seedPregnancyContent() {
    const existing = await prisma.pregnancy_day_content.findMany({
      select: { day_number: true },
    });

    const existingDays = new Set(existing.map((item) => item.day_number));
    const records = [];

    for (let dayNumber = 1; dayNumber <= 280; dayNumber += 1) {
      if (!existingDays.has(dayNumber)) {
        records.push(buildPregnancyDayRecord(dayNumber));
      }
    }

    if (records.length > 0) {
      await prisma.pregnancy_day_content.createMany({
        data: records,
      });
    }

    const total = await prisma.pregnancy_day_content.count();

    return {
      inserted: records.length,
      total,
      message:
        records.length > 0
          ? "Pregnancy day content seeded successfully"
          : "Pregnancy day content already exists",
    };
  },
};
