import { modelDefinitions } from "../constants/modelDefinitions.js";
import { userPregnancyProfilesService } from "../services/userPregnancyProfiles.service.js";
import { createCrudController } from "../utils/crudControllerFactory.js";

export const userPregnancyProfilesController = createCrudController(modelDefinitions.user_pregnancy_profiles, userPregnancyProfilesService);
