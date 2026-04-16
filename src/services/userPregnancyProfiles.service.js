import { modelDefinitions } from "../constants/modelDefinitions.js";
import { createCrudService } from "../utils/crudServiceFactory.js";

export const userPregnancyProfilesService = createCrudService(modelDefinitions.user_pregnancy_profiles);
