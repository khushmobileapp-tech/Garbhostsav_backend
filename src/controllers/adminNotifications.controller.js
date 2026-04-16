import { sendSuccess } from "../utils/apiResponse.js";
import { adminNotificationsService } from "../services/adminNotifications.service.js";

export const adminNotificationsController = {
  runDailyActivities: async (req, res) =>
    sendSuccess(res, {
      message: "Daily activity notifications processed successfully",
      data: await adminNotificationsService.runDailyActivities(req.body),
    }),

  runEventNotifications: async (req, res) =>
    sendSuccess(res, {
      message: "Event notifications processed successfully",
      data: await adminNotificationsService.runEventNotifications(req.body),
    }),

  runAll: async (req, res) =>
    sendSuccess(res, {
      message: "Notification jobs processed successfully",
      data: await adminNotificationsService.runAll(req.body),
    }),
};
