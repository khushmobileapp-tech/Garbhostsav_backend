import { modelDefinitions } from "../constants/modelDefinitions.js";
import { createCrudService } from "../utils/crudServiceFactory.js";

export const adminUsersService = createCrudService(modelDefinitions.admin_users);
