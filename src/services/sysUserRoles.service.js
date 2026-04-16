import { modelDefinitions } from "../constants/modelDefinitions.js";
import { createCrudService } from "../utils/crudServiceFactory.js";

export const sysUserRolesService = createCrudService(modelDefinitions.sys_user_roles);
