import { Router } from "express";
import { otpVerificationController } from "../controllers/otpVerification.controller.js";
import { otpVerificationDto } from "../dtos/otpVerification.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", catchAsync(otpVerificationController.findAll));
router.get("/:id", validate(otpVerificationDto.paramsSchema, "params"), catchAsync(otpVerificationController.findById));
router.post("/", validate(otpVerificationDto.createSchema), catchAsync(otpVerificationController.create));
router.patch("/:id", validate(otpVerificationDto.paramsSchema, "params"), validate(otpVerificationDto.updateSchema), catchAsync(otpVerificationController.update));
router.delete("/:id", validate(otpVerificationDto.paramsSchema, "params"), catchAsync(otpVerificationController.remove));

export const otpVerificationRouter = router;
