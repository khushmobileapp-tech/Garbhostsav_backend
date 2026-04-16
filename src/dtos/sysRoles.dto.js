import { buildDtoSchemas } from "../utils/crudSchemaFactory.js";
import { modelDefinitions } from "../constants/modelDefinitions.js";

export const sysRolesDto = buildDtoSchemas(modelDefinitions.sys_roles);
