import { Router } from "express";
import { sysRolesController } from "../controllers/sysRoles.controller.js";
import { sysRolesDto } from "../dtos/sysRoles.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", catchAsync(sysRolesController.findAll));
router.get("/:id", validate(sysRolesDto.paramsSchema, "params"), catchAsync(sysRolesController.findById));
router.post("/", validate(sysRolesDto.createSchema), catchAsync(sysRolesController.create));
router.patch("/:id", validate(sysRolesDto.paramsSchema, "params"), validate(sysRolesDto.updateSchema), catchAsync(sysRolesController.update));
router.delete("/:id", validate(sysRolesDto.paramsSchema, "params"), catchAsync(sysRolesController.remove));

export const sysRolesRouter = router;
