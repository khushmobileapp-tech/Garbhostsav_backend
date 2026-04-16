import { z } from "zod";

const sessionSchema = z.enum(["morning", "afternoon", "evening"]);

const subActivitySchema = z.object({
  type: z.enum(["text", "audio", "video"]),
  value: z.string().trim().min(1),
});

const activitySchema = z.object({
  type: z.string().trim().min(1).max(50),
  title: z.string().trim().min(1).max(255),
  content: z.string().trim().optional().nullable(),
  media_url: z.string().trim().url().optional().nullable().or(z.literal("")),
  video_url: z.string().trim().url().optional().nullable().or(z.literal("")),
  youtube_video_url: z.string().trim().url().optional().nullable().or(z.literal("")),
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
