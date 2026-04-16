import { modelDefinitions } from "../constants/modelDefinitions.js";
import { adminUsersService } from "../services/adminUsers.service.js";
import { createCrudController } from "../utils/crudControllerFactory.js";

export const adminUsersController = createCrudController(modelDefinitions.admin_users, adminUsersService);
