import { sendSuccess } from "../utils/apiResponse.js";
import { activityContentService } from "../services/activityContent.service.js";

export const activityContentController = {
  create: async (req, res) =>
    sendSuccess(res, {
      statusCode: 201,
      message: "Activity content created successfully",
      data: await activityContentService.create(req.body),
    }),

  findAll: async (_req, res) =>
    sendSuccess(res, {
      message: "Activity content fetched successfully",
      data: await activityContentService.findAll(),
    }),

  findById: async (req, res) =>
    sendSuccess(res, {
      message: "Activity content fetched successfully",
      data: await activityContentService.findById(req.params.id),
    }),

  update: async (req, res) =>
    sendSuccess(res, {
      message: "Activity content updated successfully",
      data: await activityContentService.update(req.params.id, req.body),
    }),

  remove: async (req, res) =>
    sendSuccess(res, {
      message: "Activity content deleted successfully",
      data: await activityContentService.remove(req.params.id),
    }),
};
