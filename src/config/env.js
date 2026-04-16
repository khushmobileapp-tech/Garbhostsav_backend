import "dotenv/config.js";

export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development",
  authTokenSecret: process.env.AUTH_TOKEN_SECRET || "change-this-auth-secret",
  notificationSchedulerEnabled:
    (process.env.NOTIFICATION_SCHEDULER_ENABLED || "true").toLowerCase() !== "false",
};
