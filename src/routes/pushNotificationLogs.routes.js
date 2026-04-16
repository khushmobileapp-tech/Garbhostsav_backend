import { Router } from "express";
import { pushNotificationLogsController } from "../controllers/pushNotificationLogs.controller.js";
import { pushNotificationLogsDto } from "../dtos/pushNotificationLogs.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", catchAsync(pushNotificationLogsController.findAll));
router.get("/:id", validate(pushNotificationLogsDto.paramsSchema, "params"), catchAsync(pushNotificationLogsController.findById));
router.post("/", validate(pushNotificationLogsDto.createSchema), catchAsync(pushNotificationLogsController.create));
router.patch("/:id", validate(pushNotificationLogsDto.paramsSchema, "params"), validate(pushNotificationLogsDto.updateSchema), catchAsync(pushNotificationLogsController.update));
router.delete("/:id", validate(pushNotificationLogsDto.paramsSchema, "params"), catchAsync(pushNotificationLogsController.remove));

export const pushNotificationLogsRouter = router;
