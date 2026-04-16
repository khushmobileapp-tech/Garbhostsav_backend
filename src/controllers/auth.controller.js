import { sendSuccess } from "../utils/apiResponse.js";
import { authService } from "../services/auth.service.js";

export const authController = {
  registerRequestOtp: async (req, res) =>
    sendSuccess(res, {
      message: "OTP sent for registration",
      data: await authService.registerRequestOtp(req.body),
    }),

  registerVerifyOtp: async (req, res) =>
    console.log("Register Verify OTP Request Body:", req.body) || // Debug log
    sendSuccess(res, {
      message: "Registration completed successfully",
      data: await authService.registerVerifyOtp(req.body),
    }),

  loginRequestOtp: async (req, res) =>
    sendSuccess(res, {
      message: "OTP sent for login",
      data: await authService.loginRequestOtp(req.body),
    }),

  loginVerifyOtp: async (req, res) =>
    sendSuccess(res, {
      message: "Login successful",
      data: await authService.loginVerifyOtp(req.body),
    }),

  freeTrialLogin: async (req, res) =>
    sendSuccess(res, {
      message: "Free trial login successful",
      data: await authService.startFreeTrial(req.body),
    }),
};
