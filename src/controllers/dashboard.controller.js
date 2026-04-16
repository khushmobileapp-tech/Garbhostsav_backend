import { sendSuccess } from "../utils/apiResponse.js";
import { dashboardService } from "../services/dashboard.service.js";

export const dashboardController = {
  me: async (req, res) =>
    sendSuccess(res, {
      message: "Dashboard fetched successfully",
      data: await dashboardService.getDashboard(req.user.id),
    }),

  dailyContent: async (req, res) =>
    sendSuccess(res, {
      message: "Daily content fetched successfully",
      data: await dashboardService.getDailyContent(req.params.dayNumber),
    }),

  seedContent: async (_req, res) =>
    sendSuccess(res, {
      message: "Pregnancy content seed completed",
      data: await dashboardService.seedPregnancyContent(),
    }),
};
