import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authDto } from "../dtos/auth.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.post(
  "/register/request-otp",
  validate(authDto.registerRequestOtpSchema),
  catchAsync(authController.registerRequestOtp),
);
router.post(
  "/register/verify-otp",
  validate(authDto.registerVerifyOtpSchema),
  catchAsync(authController.registerVerifyOtp),
);
router.post(
  "/login/request-otp",
  validate(authDto.loginRequestOtpSchema),
  catchAsync(authController.loginRequestOtp),
);
router.post(
  "/login/verify-otp",
  validate(authDto.loginVerifyOtpSchema),
  catchAsync(authController.loginVerifyOtp),
);
router.post(
  "/free-trial",
  validate(authDto.trialLoginSchema),
  catchAsync(authController.freeTrialLogin),
);

export const authRouter = router;
