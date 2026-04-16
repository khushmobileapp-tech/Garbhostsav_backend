import { Router } from "express";
import { eventsController } from "../controllers/events.controller.js";
import { eventsDto } from "../dtos/events.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", catchAsync(eventsController.findAll));
router.get("/:id", validate(eventsDto.paramsSchema, "params"), catchAsync(eventsController.findById));
router.post("/", validate(eventsDto.createSchema), catchAsync(eventsController.create));
router.patch("/:id", validate(eventsDto.paramsSchema, "params"), validate(eventsDto.updateSchema), catchAsync(eventsController.update));
router.delete("/:id", validate(eventsDto.paramsSchema, "params"), catchAsync(eventsController.remove));

export const eventsRouter = router;
