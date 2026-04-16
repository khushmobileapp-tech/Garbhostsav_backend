import { sendSuccess } from "../utils/apiResponse.js";
import { notificationsDto } from "../dtos/notifications.dto.js";
import { notificationsService } from "../services/notifications.service.js";

export const notificationsController = {
  list: async (req, res) => {
    const query = notificationsDto.listSchema.parse(req.query ?? {});

    return sendSuccess(res, {
      message: "Notifications fetched successfully",
      data: await notificationsService.listForUser(req.user.id, query),
    });
  },

  markRead: async (req, res) =>
    sendSuccess(res, {
      message: "Notification marked as read",
      data: await notificationsService.markRead(req.user.id, req.params.id),
    }),

  markAllRead: async (req, res) =>
    sendSuccess(res, {
      message: "All notifications marked as read",
      data: await notificationsService.markAllRead(req.user.id),
    }),

  registerDeviceToken: async (req, res) =>
    sendSuccess(res, {
      message: "Device token saved successfully",
      data: await notificationsService.registerDeviceToken(req.user.id, req.body),
    }),
};
