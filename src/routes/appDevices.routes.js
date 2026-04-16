import { Router } from "express";
import { appDevicesController } from "../controllers/appDevices.controller.js";
import { appDevicesDto } from "../dtos/appDevices.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", catchAsync(appDevicesController.findAll));
router.get("/:id", validate(appDevicesDto.paramsSchema, "params"), catchAsync(appDevicesController.findById));
router.post("/", validate(appDevicesDto.createSchema), catchAsync(appDevicesController.create));
router.patch("/:id", validate(appDevicesDto.paramsSchema, "params"), validate(appDevicesDto.updateSchema), catchAsync(appDevicesController.update));
router.delete("/:id", validate(appDevicesDto.paramsSchema, "params"), catchAsync(appDevicesController.remove));

export const appDevicesRouter = router;
