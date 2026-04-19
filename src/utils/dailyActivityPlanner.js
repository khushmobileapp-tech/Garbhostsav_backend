import { prisma } from "../lib/prisma.js";

export const SESSION_KEYS = ["morning", "afternoon", "evening"];

const timeslotMap = {
  Morning: "morning",
  Afternoon: "afternoon",
  Evening: "evening",
};

const reverseTimeslotMap = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

const palette = {
  meditation: { emoji: "Meditation", color: "#7B61C1", bg_color: "#F3EEFB" },
  music: { emoji: "Music", color: "#4A90C4", bg_color: "#EBF3FA" },
  video: { emoji: "Video", color: "#E25D52", bg_color: "#FDECE9" },
  audio: { emoji: "Audio", color: "#4A90C4", bg_color: "#EBF3FA" },
  reading: { emoji: "Reading", color: "#D4697A", bg_color: "#FAEEF0" },
  affirmation: { emoji: "Affirmation", color: "#E8836B", bg_color: "#FFF0EC" },
  tip: { emoji: "Tip", color: "#6DBE8A", bg_color: "#E3F5EA" },
  text: { emoji: "Reading", color: "#D4697A", bg_color: "#FAEEF0" },
  generic: { emoji: "Activity", color: "#8D5AA6", bg_color: "#F4ECFA" },
};

function buildCompletionMap(completions = []) {
  return new Map(completions.map((item) => [`${item.activity_id}:${item.session}`, item]));
}

function applyCompletionStatus(activity, session, completionMap) {
  const completion = completionMap.get(`${activity.id}:${session}`);

  return {
    ...activity,
    session,
    is_completed: completion?.is_completed ?? false,
    completed_at: completion?.completed_at ?? null,
  };
}

function guessType(activity, preferredType) {
  if (preferredType) {
    return preferredType;
  }

  const title = `${activity.title || ""} ${activity.description || ""}`.toLowerCase();

  if (title.includes("meditation")) return "meditation";
  if (title.includes("music") || title.includes("audio")) return "music";
  if (title.includes("affirm")) return "affirmation";
  if (title.includes("tip") || title.includes("water")) return "tip";
  if (title.includes("read")) return "reading";

  return "generic";
}

function resolveContentEntries(entries = [], dayNumber, activityType) {
  const sortedEntries = [...entries].sort((left, right) => {
    const leftPriority = getEntryPriority(left, dayNumber);
    const rightPriority = getEntryPriority(right, dayNumber);

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return (left.id ?? 0) - (right.id ?? 0);
  });

  const primaryByType = new Map();
  const subActivities = [];

  for (const entry of sortedEntries) {
    if (entry.is_primary !== false && !primaryByType.has(entry.type)) {
      primaryByType.set(entry.type, entry);
      continue;
    }

    subActivities.push({
      id: String(entry.id),
      type: entry.type,
      value: entry.url,
    });
  }

  return {
    text: primaryByType.get("text")?.url || null,
    audio: primaryByType.get("audio")?.url || null,
    video: primaryByType.get("video")?.url || null,
    activity_type: activityType || null,
    sub_activities: subActivities,
  };
}

function getEntryPriority(entry, dayNumber) {
  if (entry.day_number === dayNumber) {
    return 0;
  }

  if (entry.day_number == null) {
    return 1;
  }

  if (entry.day_number < dayNumber) {
    return 2 + (dayNumber - entry.day_number);
  }

  return 1000 + (entry.day_number - dayNumber);
}

function pickPrimaryEntriesByType(entries = []) {
  const sortedEntries = [...entries].sort((left, right) => {
    const leftIsPrimary = left.is_primary !== false ? 0 : 1;
    const rightIsPrimary = right.is_primary !== false ? 0 : 1;

    if (leftIsPrimary !== rightIsPrimary) {
      return leftIsPrimary - rightIsPrimary;
    }

    return (left.id ?? 0) - (right.id ?? 0);
  });
  const chosenByType = new Map();

  for (const entry of sortedEntries) {
    if (!chosenByType.has(entry.type)) {
      chosenByType.set(entry.type, entry);
    }
  }

  return [...chosenByType.values()];
}

function mergeWithGlobalFillers(baseEntries = [], globalEntries = []) {
  const chosen = [...baseEntries];
  const chosenTypes = new Set(baseEntries.map((entry) => entry.type));

  for (const entry of pickPrimaryEntriesByType(globalEntries)) {
    if (chosenTypes.has(entry.type)) {
      continue;
    }

    chosen.push(entry);
    chosenTypes.add(entry.type);
  }

  return chosen;
}

function selectRelevantContentEntries(entries = [], dayNumber) {
  const globalEntries = entries.filter((entry) => entry.day_number == null);
  const datedEntries = entries.filter((entry) => entry.day_number != null);

  const exactEntries = datedEntries.filter((entry) => entry.day_number === dayNumber);
  if (exactEntries.length > 0) {
    return mergeWithGlobalFillers(exactEntries, globalEntries);
  }

  if (datedEntries.length === 0) {
    return pickPrimaryEntriesByType(globalEntries);
  }

  const pastDays = [...new Set(datedEntries.map((entry) => entry.day_number).filter((value) => value <= dayNumber))].sort(
    (left, right) => right - left,
  );
  const futureDays = [...new Set(datedEntries.map((entry) => entry.day_number).filter((value) => value > dayNumber))].sort(
    (left, right) => left - right,
  );

  const fallbackDay = pastDays[0] ?? futureDays[0];

  return [
    ...mergeWithGlobalFillers(
      datedEntries.filter((entry) => entry.day_number === fallbackDay),
      globalEntries,
    ),
  ];
}

function scoreEntrySet(entries = [], dayNumber) {
  const exactExists = entries.some((entry) => entry.day_number === dayNumber);
  if (exactExists) {
    return 0;
  }

  const datedDays = [...new Set(entries.map((entry) => entry.day_number).filter((value) => value != null))];
  if (datedDays.length === 0) {
    return 100000;
  }

  const nearestPast = datedDays.filter((value) => value <= dayNumber).sort((left, right) => right - left)[0];
  if (nearestPast != null) {
    return dayNumber - nearestPast + 1;
  }

  const nearestFuture = datedDays.sort((left, right) => left - right)[0];
  return 50000 + (nearestFuture - dayNumber);
}

function selectBestFallbackEntries(entries = [], dayNumber) {
  if (entries.length === 0) {
    return [];
  }

  const grouped = new Map();
  for (const entry of entries) {
    const key = entry.activity_id;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(entry);
  }

  const candidates = [...grouped.values()].map((groupEntries) => ({
    activity_id: groupEntries[0].activity_id,
    score: scoreEntrySet(groupEntries, dayNumber),
    entries: groupEntries,
  }));

  candidates.sort((left, right) => {
    if (left.score !== right.score) {
      return left.score - right.score;
    }

    return left.activity_id - right.activity_id;
  });

  return selectRelevantContentEntries(candidates[0]?.entries || [], dayNumber);
}

function normalizeRuleActivity(rule, dayNumber) {
  const ownEntries = selectRelevantContentEntries(rule.activities.activity_content || [], dayNumber);
  const fallbackEntries =
    ownEntries.length > 0
      ? []
      : selectBestFallbackEntries(rule.activities.fallback_activity_content || [], dayNumber);
  const content = resolveContentEntries(
    ownEntries.length > 0 ? ownEntries : fallbackEntries,
    dayNumber,
    rule.activities.activity_type,
  );
  const type = guessType(
    rule.activities,
    content.activity_type ||
      (content.video ? "video" : content.audio ? "audio" : content.text ? "text" : undefined),
  );
  const visual = palette[type] || palette.generic;

  return {
    id: String(rule.activities.id),
    type,
    title: rule.activities.title,
    content: content.text || rule.activities.description,
    media_url: content.audio,
    video_url: content.video,
    emoji: visual.emoji,
    color: visual.color,
    bg_color: visual.bg_color,
    sub_activities: content.sub_activities,
    order_index: rule.order_index ?? 0,
  };
}

export function normalizeActivityRecord(record, { dayNumber = null, session = null, orderIndex = 0 } = {}) {
  const content = resolveContentEntries(
    record.activity_content || [],
    dayNumber,
    record.activity_type,
  );
  const type = guessType(
    record,
    content.activity_type ||
      (content.video ? "video" : content.audio ? "audio" : content.text ? "text" : undefined),
  );
  const visual = palette[type] || palette.generic;

  return {
    id: String(record.id),
    type,
    title: record.title,
    content: content.text || record.description || null,
    media_url: content.audio,
    video_url: content.video,
    emoji: visual.emoji,
    color: visual.color,
    bg_color: visual.bg_color,
    sub_activities: content.sub_activities,
    order_index: orderIndex,
    session,
    activity_content: record.activity_content || [],
    activity_rules: record.activity_rules || [],
    created_at: record.created_at ?? null,
    updated_at: record.updated_at ?? null,
  };
}

function buildContentRows(activityId, item, dayNumber) {
  const rows = [];
  const seen = new Set();

  const appendRow = (type, value) => {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (!normalized) {
      return;
    }

    const key = `${type}:${normalized}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    rows.push({
      activity_id: activityId,
      type,
      url: normalized,
      day_number: dayNumber,
      is_primary: true,
    });
  };

  appendRow("text", item.content);
  appendRow("audio", item.media_url);
  appendRow("video", item.video_url || item.youtube_video_url);

  (item.sub_activities || []).forEach((subActivity) => {
    const normalized = typeof subActivity.value === "string" ? subActivity.value.trim() : "";
    if (!normalized) {
      return;
    }

    const key = `${subActivity.type}:${normalized}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    rows.push({
      activity_id: activityId,
      type: subActivity.type,
      url: normalized,
      day_number: dayNumber,
      is_primary: false,
    });
  });

  return rows;
}

export function flattenSessions(sessions) {
  return SESSION_KEYS.flatMap((session) => sessions[session] || []);
}

export function buildEmptyDayPlan(dayNumber) {
  return {
    day_number: dayNumber,
    theme_title: "",
    overview: "",
    sessions: {
      morning: [],
      afternoon: [],
      evening: [],
    },
  };
}

export function normalizeAdminDayFromRules(dayNumber, rules, source = "rule_based", completions = []) {
  const completionMap = buildCompletionMap(completions);
  const sessions = {
    morning: [],
    afternoon: [],
    evening: [],
  };

  for (const rule of rules) {
    const session = timeslotMap[rule.timeslot] || "afternoon";
    const activity = normalizeRuleActivity(rule, dayNumber);
    sessions[session].push(applyCompletionStatus(activity, session, completionMap));
  }

  for (const session of SESSION_KEYS) {
    sessions[session].sort((left, right) => (left.order_index ?? 0) - (right.order_index ?? 0));
  }

  return {
    source,
    day_number: dayNumber,
    theme_title: "",
    overview: "",
    sessions,
  };
}

export async function fetchRulesForDay(dayNumber, { exactOnly = false } = {}) {
  const rules = await prisma.activity_rules.findMany({
    where: exactOnly
      ? {
          start_day: dayNumber,
          end_day: dayNumber,
        }
      : {
          start_day: { lte: dayNumber },
          end_day: { gte: dayNumber },
        },
    orderBy: [
      { timeslot: "asc" },
      { order_index: "asc" },
      { id: "asc" },
    ],
    include: {
      activities: {
        include: {
          activity_content: {
            where: {
              OR: [{ day_number: null }, { day_number: dayNumber }],
            },
            orderBy: [{ day_number: "desc" }, { id: "asc" }],
          },
        },
      },
    },
  });

  const rulesMissingContent = rules.filter(
    (rule) => (rule.activities.activity_content || []).length === 0,
  );

  if (rulesMissingContent.length === 0) {
    return rules;
  }

  const fallbackTitles = [
    ...new Set(rulesMissingContent.map((rule) => rule.activities.title).filter(Boolean)),
  ];

  const fallbackContentRows = await prisma.activity_content.findMany({
    where: {
      activities: {
        title: {
          in: fallbackTitles,
        },
      },
    },
    include: {
      activities: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: [{ day_number: "asc" }, { id: "asc" }],
  });

  const fallbackByTitle = new Map();
  for (const row of fallbackContentRows) {
    const title = row.activities?.title;
    if (!title) {
      continue;
    }

    if (!fallbackByTitle.has(title)) {
      fallbackByTitle.set(title, []);
    }

    fallbackByTitle.get(title).push(row);
  }

  for (const rule of rules) {
    if ((rule.activities.activity_content || []).length > 0) {
      continue;
    }

    rule.activities.fallback_activity_content = fallbackByTitle.get(rule.activities.title) || [];
  }

  return rules;
}

export async function fetchResolvedDay(dayNumber, completions = []) {
  const exactRules = await fetchRulesForDay(dayNumber, { exactOnly: true });

  if (exactRules.length > 0) {
    return normalizeAdminDayFromRules(dayNumber, exactRules, "custom", completions);
  }

  const rangedRules = await fetchRulesForDay(dayNumber);

  if (rangedRules.length > 0) {
    return normalizeAdminDayFromRules(dayNumber, rangedRules, "rule_based", completions);
  }

  return {
    source: "empty",
    ...buildEmptyDayPlan(dayNumber),
  };
}

export async function getDayGridSummary() {
  const rules = await prisma.activity_rules.findMany({
    select: {
      start_day: true,
      end_day: true,
      order_index: true,
    },
  });

  const exactDayMap = new Map();
  const rangeDaySet = new Set();

  for (const rule of rules) {
    if (rule.start_day === rule.end_day) {
      exactDayMap.set(rule.start_day, (exactDayMap.get(rule.start_day) || 0) + 1);
      continue;
    }

    for (let day = rule.start_day; day <= rule.end_day; day += 1) {
      if (day >= 1 && day <= 280) {
        rangeDaySet.add(day);
      }
    }
  }

  return Array.from({ length: 280 }, (_, index) => {
    const dayNumber = index + 1;
    const exactCount = exactDayMap.get(dayNumber) || 0;

    return {
      day_number: dayNumber,
      has_custom_content: exactCount > 0,
      has_legacy_content: rangeDaySet.has(dayNumber),
      activity_count: exactCount,
      sub_activity_count: 0,
      theme_title: "",
    };
  });
}

export async function replaceDayActivities(dayNumber, payload) {
  const existingDay = await fetchResolvedDay(dayNumber);
  const mergedPayload = {
    sessions: {
      morning: payload.sessions?.morning ?? existingDay.sessions?.morning ?? [],
      afternoon: payload.sessions?.afternoon ?? existingDay.sessions?.afternoon ?? [],
      evening: payload.sessions?.evening ?? existingDay.sessions?.evening ?? [],
    },
  };

  const exactRules = await prisma.activity_rules.findMany({
    where: {
      start_day: dayNumber,
      end_day: dayNumber,
    },
    select: {
      id: true,
      activity_id: true,
    },
  });

  const activityIdsToDelete = [...new Set(exactRules.map((item) => item.activity_id))];

  await prisma.$transaction(async (tx) => {
    if (exactRules.length > 0) {
      await tx.activity_rules.deleteMany({
        where: {
          start_day: dayNumber,
          end_day: dayNumber,
        },
      });

      if (activityIdsToDelete.length > 0) {
        await tx.activity_content.deleteMany({
          where: {
            activity_id: { in: activityIdsToDelete },
          },
        });

        await tx.activities.deleteMany({
          where: {
            id: { in: activityIdsToDelete },
          },
        });
      }
    }

    for (const session of SESSION_KEYS) {
      const sessionItems = mergedPayload.sessions?.[session] || [];

      for (let index = 0; index < sessionItems.length; index += 1) {
        const item = sessionItems[index];
        const activity = await tx.activities.create({
          data: {
            title: item.title,
            description: item.content || null,
            activity_type: item.type || "generic",
          },
        });

        await tx.activity_rules.create({
          data: {
            activity_id: activity.id,
            timeslot: reverseTimeslotMap[session],
            start_day: dayNumber,
            end_day: dayNumber,
            order_index: index,
          },
        });

        const contentRows = buildContentRows(activity.id, item, dayNumber);

        if (contentRows.length > 0) {
          await tx.activity_content.createMany({
            data: contentRows,
          });
        }
      }
    }
  });

  return fetchResolvedDay(dayNumber);
}

export async function deleteExactDayActivities(dayNumber) {
  const exactRules = await prisma.activity_rules.findMany({
    where: {
      start_day: dayNumber,
      end_day: dayNumber,
    },
    select: {
      activity_id: true,
    },
  });

  if (exactRules.length === 0) {
    return false;
  }

  const activityIds = [...new Set(exactRules.map((item) => item.activity_id))];

  await prisma.$transaction(async (tx) => {
    await tx.activity_rules.deleteMany({
      where: {
        start_day: dayNumber,
        end_day: dayNumber,
      },
    });

    await tx.activity_content.deleteMany({
      where: {
        activity_id: { in: activityIds },
      },
    });

    await tx.activities.deleteMany({
      where: {
        id: { in: activityIds },
      },
    });
  });

  return true;
}
