import { buildDtoSchemas } from "../utils/crudSchemaFactory.js";
import { modelDefinitions } from "../constants/modelDefinitions.js";

export const userPregnancyProfilesDto = buildDtoSchemas(modelDefinitions.user_pregnancy_profiles);
