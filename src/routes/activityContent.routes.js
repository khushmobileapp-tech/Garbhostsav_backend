import { Router } from "express";
import { activityContentController } from "../controllers/activityContent.controller.js";
import { activityContentDto } from "../dtos/activityContent.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", catchAsync(activityContentController.findAll));
router.get("/:id", validate(activityContentDto.paramsSchema, "params"), catchAsync(activityContentController.findById));
router.post("/", validate(activityContentDto.createSchema), catchAsync(activityContentController.create));
router.patch("/:id", validate(activityContentDto.paramsSchema, "params"), validate(activityContentDto.updateSchema), catchAsync(activityContentController.update));
router.delete("/:id", validate(activityContentDto.paramsSchema, "params"), catchAsync(activityContentController.remove));

export const activityContentRouter = router;
