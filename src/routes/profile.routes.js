import { Router } from "express";
import { profileController } from "../controllers/profile.controller.js";
import { profileDto } from "../dtos/profile.dto.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.use(catchAsync(authenticate));

router.get("/me", catchAsync(profileController.getMe));
router.patch("/me", validate(profileDto.updateSchema), catchAsync(profileController.updateMe));

export const profileRouter = router;
