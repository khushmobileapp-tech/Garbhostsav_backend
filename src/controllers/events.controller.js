import { modelDefinitions } from "../constants/modelDefinitions.js";
import { eventsService } from "../services/events.service.js";
import { createCrudController } from "../utils/crudControllerFactory.js";

export const eventsController = createCrudController(modelDefinitions.events, eventsService);
