import { Router } from "express";
import { userEventsController } from "../controllers/userEvents.controller.js";
import { userEventsDto } from "../dtos/userEvents.dto.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.use(catchAsync(authenticate));

router.get("/", catchAsync(userEventsController.list));
router.post("/register", validate(userEventsDto.registerSchema), catchAsync(userEventsController.register));

export const userEventsRouter = router;
