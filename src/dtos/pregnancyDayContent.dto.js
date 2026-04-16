import { buildDtoSchemas } from "../utils/crudSchemaFactory.js";
import { modelDefinitions } from "../constants/modelDefinitions.js";

export const pregnancyDayContentDto = buildDtoSchemas(modelDefinitions.pregnancy_day_content);
