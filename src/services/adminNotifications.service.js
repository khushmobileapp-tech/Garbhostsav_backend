import { notificationEngineService } from "./notificationEngine.service.js";

export const adminNotificationsService = {
  async runDailyActivities(payload) {
    return notificationEngineService.runDailyActivityNotifications(payload.date_time ?? new Date());
  },

  async runEventNotifications(payload) {
    return notificationEngineService.runEventNotifications(payload.date_time ?? new Date());
  },

  async runAll(payload) {
    return notificationEngineService.runAll(payload.date_time ?? new Date());
  },
};
