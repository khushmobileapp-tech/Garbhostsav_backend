import { Router } from "express";
import { dailyActivityController } from "../controllers/dailyActivity.controller.js";
import { dailyActivityDto } from "../dtos/dailyActivity.dto.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.use(catchAsync(authenticate));

router.get("/today", catchAsync(dailyActivityController.today));
router.get(
  "/day/:dayNumber",
  validate(dailyActivityDto.dayParamsSchema, "params"),
  catchAsync(dailyActivityController.byDay),
);
router.post(
  "/complete",
  validate(dailyActivityDto.completeSchema),
  catchAsync(dailyActivityController.markCompleted),
);

export const dailyActivityRouter = router;
