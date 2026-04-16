import { sendSuccess } from "../utils/apiResponse.js";
import { adminUsersOverviewService } from "../services/adminUsersOverview.service.js";

export const adminUsersOverviewController = {
  getUserMaster: async (_req, res) =>
    sendSuccess(res, {
      message: "User master fetched successfully",
      data: await adminUsersOverviewService.getUserMaster(),
    }),
};
