import { sendSuccess } from "../utils/apiResponse.js";
import { userEventsService } from "../services/userEvents.service.js";

export const userEventsController = {
  list: async (req, res) =>
    sendSuccess(res, {
      message: "Events fetched successfully",
      data: await userEventsService.listEvents(req.user.id),
    }),

  register: async (req, res) =>
    sendSuccess(res, {
      message: "Event registered successfully",
      data: await userEventsService.registerForEvent(req.user.id, req.body.event_id),
    }),
};
