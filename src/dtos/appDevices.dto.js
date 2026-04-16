import { buildDtoSchemas } from "../utils/crudSchemaFactory.js";
import { modelDefinitions } from "../constants/modelDefinitions.js";

export const appDevicesDto = buildDtoSchemas(modelDefinitions.app_devices);
