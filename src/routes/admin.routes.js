import { Router } from "express";
import { adminDailyActivitiesController } from "../controllers/adminDailyActivities.controller.js";
import { adminNotificationsController } from "../controllers/adminNotifications.controller.js";
import { adminUsersOverviewController } from "../controllers/adminUsersOverview.controller.js";
import { eventsController } from "../controllers/events.controller.js";
import { pregnancyDayContentController } from "../controllers/pregnancyDayContent.controller.js";
import { adminDailyActivitiesDto } from "../dtos/adminDailyActivities.dto.js";
import { eventsDto } from "../dtos/events.dto.js";
import { adminNotificationsDto } from "../dtos/adminNotifications.dto.js";
import { pregnancyDayContentDto } from "../dtos/pregnancyDayContent.dto.js";
import { authenticateAdmin } from "../middlewares/authenticateAdmin.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.use(catchAsync(authenticateAdmin));

router.get("/user-master", catchAsync(adminUsersOverviewController.getUserMaster));
router.post(
  "/notifications/run-daily-activities",
  validate(adminNotificationsDto.runSchema),
  catchAsync(adminNotificationsController.runDailyActivities),
);
router.post(
  "/notifications/run-events",
  validate(adminNotificationsDto.runSchema),
  catchAsync(adminNotificationsController.runEventNotifications),
);
router.post(
  "/notifications/run-all",
  validate(adminNotificationsDto.runSchema),
  catchAsync(adminNotificationsController.runAll),
);

router.get("/events", catchAsync(eventsController.findAll));
router.get("/events/:id", validate(eventsDto.paramsSchema, "params"), catchAsync(eventsController.findById));
router.post("/events", validate(eventsDto.createSchema), catchAsync(eventsController.create));
router.patch("/events/:id", validate(eventsDto.paramsSchema, "params"), validate(eventsDto.updateSchema), catchAsync(eventsController.update));
router.delete("/events/:id", validate(eventsDto.paramsSchema, "params"), catchAsync(eventsController.remove));

router.get("/pregnancy-day-content", catchAsync(pregnancyDayContentController.findAll));
router.get("/pregnancy-day-content/:id", validate(pregnancyDayContentDto.paramsSchema, "params"), catchAsync(pregnancyDayContentController.findById));
router.post("/pregnancy-day-content", validate(pregnancyDayContentDto.createSchema), catchAsync(pregnancyDayContentController.create));
router.patch("/pregnancy-day-content/:id", validate(pregnancyDayContentDto.paramsSchema, "params"), validate(pregnancyDayContentDto.updateSchema), catchAsync(pregnancyDayContentController.update));
router.delete("/pregnancy-day-content/:id", validate(pregnancyDayContentDto.paramsSchema, "params"), catchAsync(pregnancyDayContentController.remove));

router.get("/daily-activity-days", catchAsync(adminDailyActivitiesController.getDayGrid));
router.get(
  "/daily-activity-days/:dayNumber",
  validate(adminDailyActivitiesDto.paramsSchema, "params"),
  catchAsync(adminDailyActivitiesController.getDay),
);
router.put(
  "/daily-activity-days/:dayNumber",
  validate(adminDailyActivitiesDto.paramsSchema, "params"),
  validate(adminDailyActivitiesDto.saveSchema),
  catchAsync(adminDailyActivitiesController.saveDay),
);
router.delete(
  "/daily-activity-days/:dayNumber",
  validate(adminDailyActivitiesDto.paramsSchema, "params"),
  catchAsync(adminDailyActivitiesController.deleteDay),
);

export const adminRouter = router;
