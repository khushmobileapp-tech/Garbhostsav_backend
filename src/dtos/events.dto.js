import { buildDtoSchemas } from "../utils/crudSchemaFactory.js";
import { modelDefinitions } from "../constants/modelDefinitions.js";

export const eventsDto = buildDtoSchemas(modelDefinitions.events);
