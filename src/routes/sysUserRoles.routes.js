import { Router } from "express";
import { sysUserRolesController } from "../controllers/sysUserRoles.controller.js";
import { sysUserRolesDto } from "../dtos/sysUserRoles.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", catchAsync(sysUserRolesController.findAll));
router.get("/:id", validate(sysUserRolesDto.paramsSchema, "params"), catchAsync(sysUserRolesController.findById));
router.post("/", validate(sysUserRolesDto.createSchema), catchAsync(sysUserRolesController.create));
router.patch("/:id", validate(sysUserRolesDto.paramsSchema, "params"), validate(sysUserRolesDto.updateSchema), catchAsync(sysUserRolesController.update));
router.delete("/:id", validate(sysUserRolesDto.paramsSchema, "params"), catchAsync(sysUserRolesController.remove));

export const sysUserRolesRouter = router;
