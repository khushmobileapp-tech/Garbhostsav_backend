import { randomUUID } from "node:crypto";

const palette = {
  meditation: { emoji: "Meditation", color: "#7B61C1", bg_color: "#F3EEFB" },
  music: { emoji: "Music", color: "#4A90C4", bg_color: "#EBF3FA" },
  video: { emoji: "Video", color: "#E25D52", bg_color: "#FDECE9" },
  reading: { emoji: "Reading", color: "#D4697A", bg_color: "#FAEEF0" },
  affirmation: { emoji: "Affirmation", color: "#E8836B", bg_color: "#FFF0EC" },
  tip: { emoji: "Tip", color: "#6DBE8A", bg_color: "#E3F5EA" },
};

const meditationThemes = [
  "Take 5 slow breaths and connect gently with your baby.",
  "Rest your palms on your belly and spend a quiet moment in gratitude.",
  "Focus on calm breathing and allow your body to relax from head to toe.",
];

const musicThemes = [
  "Play soft instrumental music or soothing lullabies for a few minutes today.",
  "Listen to calming sounds and let your mind settle into a peaceful rhythm.",
  "Choose gentle music that helps you and your baby feel safe and relaxed.",
];

const readingThemes = [
  "Your baby is growing beautifully, and each day supports healthy development.",
  "Today is a reminder that every small healthy choice supports your little one.",
  "Pregnancy is a daily journey of growth, bonding, and preparation.",
];

const affirmationThemes = [
  "I am strong, calm, and growing my baby with love.",
  "My body knows how to nurture my baby every single day.",
  "I trust this journey and welcome each new stage with confidence.",
];

const tipThemes = [
  "Drink enough water and take short breaks whenever your body asks for rest.",
  "Eat balanced meals and include fruits, vegetables, and protein today.",
  "A short walk, light stretching, and deep breathing can support your energy.",
];

function rotate(list, dayNumber) {
  return list[(dayNumber - 1) % list.length];
}

export function buildPregnancyDayRecord(dayNumber) {
  const week = Math.ceil(dayNumber / 7);

  return {
    id: randomUUID(),
    day_number: dayNumber,
    meditation_title: `Day ${dayNumber} Calm Meditation`,
    meditation_url: rotate(meditationThemes, dayNumber),
    music_url: rotate(musicThemes, dayNumber),
    youtube_video_url: null,
    reading_content: `Week ${week} update: ${rotate(readingThemes, dayNumber)}`,
    affirmation: rotate(affirmationThemes, dayNumber),
    tips: rotate(tipThemes, dayNumber),
  };
}

export function buildActivitiesFromContent(content, dayNumber) {
  const activities = [
    {
      id: "meditation",
      type: "meditation",
      title: content.meditation_title || `Day ${dayNumber} Meditation`,
      content: content.meditation_url || rotate(meditationThemes, dayNumber),
      ...palette.meditation,
    },
    {
      id: "music",
      type: "music",
      title: "Soothing Music",
      content: content.music_url || rotate(musicThemes, dayNumber),
      ...palette.music,
    },
  ];

  if (content.youtube_video_url) {
    activities.push({
      id: "video",
      type: "video",
      title: "Today's Video",
      content: "Watch today's guided YouTube session.",
      video_url: content.youtube_video_url,
      ...palette.video,
    });
  }

  activities.push(
    {
      id: "reading",
      type: "reading",
      title: "Today's Reading",
      content: content.reading_content || rotate(readingThemes, dayNumber),
      ...palette.reading,
    },
    {
      id: "affirmation",
      type: "affirmation",
      title: "Daily Affirmation",
      content: content.affirmation || rotate(affirmationThemes, dayNumber),
      ...palette.affirmation,
    },
    {
      id: "tip",
      type: "tip",
      title: "Health Tip",
      content: content.tips || rotate(tipThemes, dayNumber),
      ...palette.tip,
    },
  );

  return activities;
}

export function groupActivitiesBySession(activities, completions = []) {
  const completionMap = new Map(
    completions.map((item) => [`${item.activity_id}:${item.session}`, item]),
  );

  const sessionMap = {
    morning: ["meditation", "affirmation"],
    afternoon: ["reading", "tip"],
    evening: ["music", "video"],
  };

  const withStatus = activities.map((activity) => {
    const session =
      Object.entries(sessionMap).find(([, ids]) => ids.includes(activity.id))?.[0] ||
      "afternoon";
    const completion = completionMap.get(`${activity.id}:${session}`);

    return {
      ...activity,
      session,
      is_completed: completion?.is_completed ?? false,
      completed_at: completion?.completed_at ?? null,
    };
  });

  return {
    morning: withStatus.filter((item) => item.session === "morning"),
    afternoon: withStatus.filter((item) => item.session === "afternoon"),
    evening: withStatus.filter((item) => item.session === "evening"),
  };
}
