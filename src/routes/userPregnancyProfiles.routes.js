import { Router } from "express";
import { userPregnancyProfilesController } from "../controllers/userPregnancyProfiles.controller.js";
import { userPregnancyProfilesDto } from "../dtos/userPregnancyProfiles.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", catchAsync(userPregnancyProfilesController.findAll));
router.get("/:id", validate(userPregnancyProfilesDto.paramsSchema, "params"), catchAsync(userPregnancyProfilesController.findById));
router.post("/", validate(userPregnancyProfilesDto.createSchema), catchAsync(userPregnancyProfilesController.create));
router.patch("/:id", validate(userPregnancyProfilesDto.paramsSchema, "params"), validate(userPregnancyProfilesDto.updateSchema), catchAsync(userPregnancyProfilesController.update));
router.delete("/:id", validate(userPregnancyProfilesDto.paramsSchema, "params"), catchAsync(userPregnancyProfilesController.remove));

export const userPregnancyProfilesRouter = router;
