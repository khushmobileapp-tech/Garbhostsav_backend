import { buildDtoSchemas } from "../utils/crudSchemaFactory.js";
import { modelDefinitions } from "../constants/modelDefinitions.js";

export const sysUsersDto = buildDtoSchemas(modelDefinitions.sys_users);
