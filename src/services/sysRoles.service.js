import { modelDefinitions } from "../constants/modelDefinitions.js";
import { createCrudService } from "../utils/crudServiceFactory.js";

export const sysRolesService = createCrudService(modelDefinitions.sys_roles);
