import { Router } from "express";
import { notificationsController } from "../controllers/notifications.controller.js";
import { notificationsDto } from "../dtos/notifications.dto.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.use(catchAsync(authenticate));

router.get("/", catchAsync(notificationsController.list));
router.patch("/read-all", catchAsync(notificationsController.markAllRead));
router.patch(
  "/:id/read",
  validate(notificationsDto.paramsSchema, "params"),
  catchAsync(notificationsController.markRead),
);
router.post(
  "/device-token",
  validate(notificationsDto.registerDeviceTokenSchema),
  catchAsync(notificationsController.registerDeviceToken),
);

export const notificationsRouter = router;
