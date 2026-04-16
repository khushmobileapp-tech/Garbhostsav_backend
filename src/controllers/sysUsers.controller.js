import { modelDefinitions } from "../constants/modelDefinitions.js";
import { sysUsersService } from "../services/sysUsers.service.js";
import { createCrudController } from "../utils/crudControllerFactory.js";

export const sysUsersController = createCrudController(modelDefinitions.sys_users, sysUsersService);
