import { buildDtoSchemas } from "../utils/crudSchemaFactory.js";
import { modelDefinitions } from "../constants/modelDefinitions.js";

export const sysUserRolesDto = buildDtoSchemas(modelDefinitions.sys_user_roles);
