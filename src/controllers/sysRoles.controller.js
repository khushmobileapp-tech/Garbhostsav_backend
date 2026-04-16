import { modelDefinitions } from "../constants/modelDefinitions.js";
import { sysRolesService } from "../services/sysRoles.service.js";
import { createCrudController } from "../utils/crudControllerFactory.js";

export const sysRolesController = createCrudController(modelDefinitions.sys_roles, sysRolesService);
