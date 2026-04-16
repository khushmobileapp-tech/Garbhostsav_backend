import { sendSuccess } from "../utils/apiResponse.js";
import { adminAuthService } from "../services/adminAuth.service.js";

export const adminAuthController = {
  login: async (req, res) =>
    sendSuccess(res, {
      message: "Admin login successful",
      data: await adminAuthService.login(req.body),
    }),
};
