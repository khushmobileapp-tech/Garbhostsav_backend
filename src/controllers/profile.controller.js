import { sendSuccess } from "../utils/apiResponse.js";
import { profileService } from "../services/profile.service.js";

export const profileController = {
  getMe: async (req, res) =>
    sendSuccess(res, {
      message: "Profile fetched successfully",
      data: await profileService.getProfile(req.user.id),
    }),

  updateMe: async (req, res) =>
    sendSuccess(res, {
      message: "Profile updated successfully",
      data: await profileService.updateProfile(req.user.id, req.body),
    }),
};
