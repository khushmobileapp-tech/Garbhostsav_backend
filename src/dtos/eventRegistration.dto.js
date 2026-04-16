import { buildDtoSchemas } from "../utils/crudSchemaFactory.js";
import { modelDefinitions } from "../constants/modelDefinitions.js";

export const eventRegistrationDto = buildDtoSchemas(modelDefinitions.event_registration);
