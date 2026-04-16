import { Router } from "express";
import { pregnancyDayContentController } from "../controllers/pregnancyDayContent.controller.js";
import { pregnancyDayContentDto } from "../dtos/pregnancyDayContent.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", catchAsync(pregnancyDayContentController.findAll));
router.get("/:id", validate(pregnancyDayContentDto.paramsSchema, "params"), catchAsync(pregnancyDayContentController.findById));
router.post("/", validate(pregnancyDayContentDto.createSchema), catchAsync(pregnancyDayContentController.create));
router.patch("/:id", validate(pregnancyDayContentDto.paramsSchema, "params"), validate(pregnancyDayContentDto.updateSchema), catchAsync(pregnancyDayContentController.update));
router.delete("/:id", validate(pregnancyDayContentDto.paramsSchema, "params"), catchAsync(pregnancyDayContentController.remove));

export const pregnancyDayContentRouter = router;
