import { sendSuccess } from "../utils/apiResponse.js";
import { activityRulesService } from "../services/activityRules.service.js";

export const activityRulesController = {
  create: async (req, res) =>
    sendSuccess(res, {
      statusCode: 201,
      message: "Activity rule created successfully",
      data: await activityRulesService.create(req.body),
    }),

  findAll: async (_req, res) =>
    sendSuccess(res, {
      message: "Activity rules fetched successfully",
      data: await activityRulesService.findAll(),
    }),

  findById: async (req, res) =>
    sendSuccess(res, {
      message: "Activity rule fetched successfully",
      data: await activityRulesService.findById(req.params.id),
    }),

  update: async (req, res) =>
    sendSuccess(res, {
      message: "Activity rule updated successfully",
      data: await activityRulesService.update(req.params.id, req.body),
    }),

  remove: async (req, res) =>
    sendSuccess(res, {
      message: "Activity rule deleted successfully",
      data: await activityRulesService.remove(req.params.id),
    }),
};
