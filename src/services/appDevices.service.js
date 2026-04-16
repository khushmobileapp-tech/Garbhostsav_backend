import { modelDefinitions } from "../constants/modelDefinitions.js";
import { createCrudService } from "../utils/crudServiceFactory.js";

export const appDevicesService = createCrudService(modelDefinitions.app_devices);
