import { modelDefinitions } from "../constants/modelDefinitions.js";
import { createCrudService } from "../utils/crudServiceFactory.js";

export const sysUsersService = createCrudService(modelDefinitions.sys_users);
