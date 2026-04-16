import { Router } from "express";
import { activityRulesController } from "../controllers/activityRules.controller.js";
import { activityRulesDto } from "../dtos/activityRules.dto.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", catchAsync(activityRulesController.findAll));
router.get("/:id", validate(activityRulesDto.paramsSchema, "params"), catchAsync(activityRulesController.findById));
router.post("/", validate(activityRulesDto.createSchema), catchAsync(activityRulesController.create));
router.patch("/:id", validate(activityRulesDto.paramsSchema, "params"), validate(activityRulesDto.updateSchema), catchAsync(activityRulesController.update));
router.delete("/:id", validate(activityRulesDto.paramsSchema, "params"), catchAsync(activityRulesController.remove));

export const activityRulesRouter = router;
