import { modelDefinitions } from "../constants/modelDefinitions.js";
import { pregnancyDayContentService } from "../services/pregnancyDayContent.service.js";
import { createCrudController } from "../utils/crudControllerFactory.js";

export const pregnancyDayContentController = createCrudController(modelDefinitions.pregnancy_day_content, pregnancyDayContentService);
