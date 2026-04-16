import { modelDefinitions } from "../constants/modelDefinitions.js";
import { createCrudService } from "../utils/crudServiceFactory.js";

export const pregnancyDayContentService = createCrudService(modelDefinitions.pregnancy_day_content);
