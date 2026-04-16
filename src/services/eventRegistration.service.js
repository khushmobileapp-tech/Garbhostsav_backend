import { modelDefinitions } from "../constants/modelDefinitions.js";
import { createCrudService } from "../utils/crudServiceFactory.js";

export const eventRegistrationService = createCrudService(modelDefinitions.event_registration);
