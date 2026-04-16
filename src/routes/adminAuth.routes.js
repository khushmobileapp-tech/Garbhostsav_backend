import { Router } from "express";
import { adminAuthController } from "../controllers/adminAuth.controller.js";
import { adminAuthDto } from "../dtos/adminAuth.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.post("/login", validate(adminAuthDto.loginSchema), catchAsync(adminAuthController.login));

export const adminAuthRouter = router;
