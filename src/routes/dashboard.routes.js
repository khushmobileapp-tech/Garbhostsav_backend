import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { dashboardDto } from "../dtos/dashboard.dto.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.use(catchAsync(authenticate));

router.get("/me", catchAsync(dashboardController.me));
router.get(
  "/daily-content/:dayNumber",
  validate(dashboardDto.dayParamsSchema, "params"),
  catchAsync(dashboardController.dailyContent),
);
router.post("/seed-pregnancy-content", catchAsync(dashboardController.seedContent));

export const dashboardRouter = router;
