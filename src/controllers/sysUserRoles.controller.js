import { modelDefinitions } from "../constants/modelDefinitions.js";
import { sysUserRolesService } from "../services/sysUserRoles.service.js";
import { createCrudController } from "../utils/crudControllerFactory.js";

export const sysUserRolesController = createCrudController(modelDefinitions.sys_user_roles, sysUserRolesService);
