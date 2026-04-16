import { buildDtoSchemas } from "../utils/crudSchemaFactory.js";
import { modelDefinitions } from "../constants/modelDefinitions.js";

export const adminUsersDto = buildDtoSchemas(modelDefinitions.admin_users);
