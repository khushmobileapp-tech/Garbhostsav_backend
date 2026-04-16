import { Router } from "express";
import { sysUsersController } from "../controllers/sysUsers.controller.js";
import { sysUsersDto } from "../dtos/sysUsers.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", catchAsync(sysUsersController.findAll));
router.get("/:id", validate(sysUsersDto.paramsSchema, "params"), catchAsync(sysUsersController.findById));
router.post("/", validate(sysUsersDto.createSchema), catchAsync(sysUsersController.create));
router.patch("/:id", validate(sysUsersDto.paramsSchema, "params"), validate(sysUsersDto.updateSchema), catchAsync(sysUsersController.update));
router.delete("/:id", validate(sysUsersDto.paramsSchema, "params"), catchAsync(sysUsersController.remove));

export const sysUsersRouter = router;
