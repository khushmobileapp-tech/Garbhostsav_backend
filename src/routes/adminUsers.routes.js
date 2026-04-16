import { Router } from "express";
import { adminUsersController } from "../controllers/adminUsers.controller.js";
import { adminUsersDto } from "../dtos/adminUsers.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", catchAsync(adminUsersController.findAll));
router.get("/:id", validate(adminUsersDto.paramsSchema, "params"), catchAsync(adminUsersController.findById));
router.post("/", validate(adminUsersDto.createSchema), catchAsync(adminUsersController.create));
router.patch("/:id", validate(adminUsersDto.paramsSchema, "params"), validate(adminUsersDto.updateSchema), catchAsync(adminUsersController.update));
router.delete("/:id", validate(adminUsersDto.paramsSchema, "params"), catchAsync(adminUsersController.remove));

export const adminUsersRouter = router;
