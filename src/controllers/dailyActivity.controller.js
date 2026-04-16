import { sendSuccess } from "../utils/apiResponse.js";
import { dailyActivityService } from "../services/dailyActivity.service.js";

export const dailyActivityController = {
  today: async (req, res) =>
    sendSuccess(res, {
      message: "Daily activities fetched successfully",
      data: await dailyActivityService.getToday(req.user.id),
    }),

  byDay: async (req, res) =>
    sendSuccess(res, {
      message: "Daily activities fetched successfully",
      data: await dailyActivityService.getByDay(req.user.id, req.params.dayNumber),
    }),

  markCompleted: async (req, res) =>
    sendSuccess(res, {
      message: "Activity status updated successfully",
      data: await dailyActivityService.markCompleted(req.user.id, req.body),
    }),
};
