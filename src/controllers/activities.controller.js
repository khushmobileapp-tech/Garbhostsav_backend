import { sendSuccess } from "../utils/apiResponse.js";
import { activitiesService } from "../services/activities.service.js";

export const activitiesController = {
  create: async (req, res) =>
    sendSuccess(res, {
      statusCode: 201,
      message: "Activity created successfully",
      data: await activitiesService.create(req.body),
    }),

  findAll: async (_req, res) =>
    sendSuccess(res, {
      message: "Activities fetched successfully",
      data: await activitiesService.findAll(),
    }),

  findById: async (req, res) =>
    sendSuccess(res, {
      message: "Activity fetched successfully",
      data: await activitiesService.findById(req.params.id),
    }),

  update: async (req, res) =>
    sendSuccess(res, {
      message: "Activity updated successfully",
      data: await activitiesService.update(req.params.id, req.body),
    }),

  remove: async (req, res) =>
    sendSuccess(res, {
      message: "Activity deleted successfully",
      data: await activitiesService.remove(req.params.id),
    }),
};
