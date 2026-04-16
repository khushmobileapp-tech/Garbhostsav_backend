import { Router } from "express";
import { eventRegistrationController } from "../controllers/eventRegistration.controller.js";
import { eventRegistrationDto } from "../dtos/eventRegistration.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", catchAsync(eventRegistrationController.findAll));
router.get("/:id", validate(eventRegistrationDto.paramsSchema, "params"), catchAsync(eventRegistrationController.findById));
router.post("/", validate(eventRegistrationDto.createSchema), catchAsync(eventRegistrationController.create));
router.patch("/:id", validate(eventRegistrationDto.paramsSchema, "params"), validate(eventRegistrationDto.updateSchema), catchAsync(eventRegistrationController.update));
router.delete("/:id", validate(eventRegistrationDto.paramsSchema, "params"), catchAsync(eventRegistrationController.remove));

export const eventRegistrationRouter = router;
