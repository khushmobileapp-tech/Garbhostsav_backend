import { z } from "zod";

const sessionSchema = z.enum(["morning", "afternoon", "evening"]);

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isLegacyFileReference(value) {
  return /^[^\s]+\.[A-Za-z0-9]{2,10}$/.test(value);
}

const optionalMediaFieldSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => (typeof value === "string" ? value.trim() : value))
  .refine(
    (value) =>
      value == null ||
      value === "" ||
      isValidUrl(value) ||
      isLegacyFileReference(value),
    {
      message: "Invalid URL",
    },
  );

const subActivitySchema = z.object({
  type: z.enum(["text", "audio", "video"]),
  value: z.string().trim().min(1),
});

const activitySchema = z.object({
  type: z.string().trim().min(1).max(50),
  title: z.string().trim().min(1).max(255),
  content: z.string().trim().optional().nullable(),
  media_url: optionalMediaFieldSchema,
  video_url: optionalMediaFieldSchema,
  youtube_video_url: optionalMediaFieldSchema,
  emoji: z.string().trim().max(50).optional().nullable(),
  color: z.string().trim().max(20).optional().nullable(),
  bg_color: z.string().trim().max(20).optional().nullable(),
  sub_activities: z.array(subActivitySchema).optional(),
});

export const adminDailyActivitiesDto = {
  paramsSchema: z.object({
    dayNumber: z.coerce.number().int().min(1).max(280),
  }),
  saveSchema: z.object({
    theme_title: z.string().trim().max(255).optional().nullable(),
    overview: z.string().trim().optional().nullable(),
    sessions: z
      .object({
        morning: z.array(activitySchema).optional(),
        afternoon: z.array(activitySchema).optional(),
        evening: z.array(activitySchema).optional(),
      })
      .optional()
      .default({}),
  }),
};
