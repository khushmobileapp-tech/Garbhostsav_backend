import { Router } from "express";
import { activitiesController } from "../controllers/activities.controller.js";
import { activitiesDto } from "../dtos/activities.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", catchAsync(activitiesController.findAll));
router.get("/:id", validate(activitiesDto.paramsSchema, "params"), catchAsync(activitiesController.findById));
router.post("/", validate(activitiesDto.createSchema), catchAsync(activitiesController.create));
router.patch("/:id", validate(activitiesDto.paramsSchema, "params"), validate(activitiesDto.updateSchema), catchAsync(activitiesController.update));
router.delete("/:id", validate(activitiesDto.paramsSchema, "params"), catchAsync(activitiesController.remove));

export const activitiesRouter = router;
