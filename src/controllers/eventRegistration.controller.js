import { modelDefinitions } from "../constants/modelDefinitions.js";
import { eventRegistrationService } from "../services/eventRegistration.service.js";
import { createCrudController } from "../utils/crudControllerFactory.js";

export const eventRegistrationController = createCrudController(modelDefinitions.event_registration, eventRegistrationService);
