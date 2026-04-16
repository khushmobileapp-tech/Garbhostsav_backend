import { sendSuccess } from "../utils/apiResponse.js";
import { adminDailyActivitiesService } from "../services/adminDailyActivities.service.js";

export const adminDailyActivitiesController = {
  getDayGrid: async (_req, res) =>
    sendSuccess(res, {
      message: "Daily activity day grid fetched successfully",
      data: await adminDailyActivitiesService.getDayGrid(),
    }),

  getDay: async (req, res) =>
    sendSuccess(res, {
      message: "Daily activity day fetched successfully",
      data: await adminDailyActivitiesService.getDay(req.params.dayNumber),
    }),

  saveDay: async (req, res) =>
    sendSuccess(res, {
      message: "Daily activity day saved successfully",
      data: await adminDailyActivitiesService.saveDay(req.params.dayNumber, req.body),
    }),

  deleteDay: async (req, res) =>
    sendSuccess(res, {
      message: "Daily activity day deleted successfully",
      data: await adminDailyActivitiesService.deleteDay(req.params.dayNumber),
    }),
};
